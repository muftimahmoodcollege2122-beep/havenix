import crypto from "crypto";
import { pool } from "../db/pool";
import { getEmailProvider } from "./emailProvider";
import { getSmsProvider } from "./smsProvider";

export type OtpChannel = "email" | "sms";

const CODE_LENGTH = 6;
const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  // Cryptographically random 6-digit code, zero-padded.
  const n = crypto.randomInt(0, 10 ** CODE_LENGTH);
  return String(n).padStart(CODE_LENGTH, "0");
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Creates a fresh OTP for the given customer/channel/target, sends it, and
 * persists the hash. Enforces a short cooldown between sends so a customer
 * (or an attacker) can't hammer the send endpoint.
 */
export async function sendOtp(customerId: string, channel: OtpChannel, target: string, customerName?: string) {
  const { rows: recent } = await pool.query(
    `SELECT created_at FROM otp_codes
     WHERE customer_id = $1 AND channel = $2
     ORDER BY created_at DESC LIMIT 1`,
    [customerId, channel]
  );
  if (recent[0]) {
    const secondsSince = (Date.now() - new Date(recent[0].created_at).getTime()) / 1000;
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      throw Object.assign(
        new Error(`Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince)}s before requesting another code.`),
        { status: 429 }
      );
    }
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await pool.query(
    `INSERT INTO otp_codes (customer_id, channel, target, code_hash, max_attempts, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [customerId, channel, target, hashCode(code), MAX_ATTEMPTS, expiresAt]
  );

  const greeting = customerName ? `Hi ${customerName.split(" ")[0]},` : "Hi,";
  const message = `${greeting} your Havenix verification code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`;

  if (channel === "email") {
    await getEmailProvider().send(
      target,
      "Your Havenix verification code",
      message,
      `<p>${greeting}</p><p>Your Havenix verification code is:</p><p style="font-size:28px;font-weight:600;letter-spacing:6px">${code}</p><p>It expires in ${CODE_TTL_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>`
    );
  } else {
    await getSmsProvider().send(target, message);
  }

  return { expiresInSeconds: CODE_TTL_MINUTES * 60 };
}

/**
 * Verifies a submitted code against the most recent unconsumed OTP for this
 * customer/channel. Tracks attempts per-code to slow down brute forcing.
 */
export async function verifyOtp(customerId: string, channel: OtpChannel, code: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT id, code_hash, attempts, max_attempts, expires_at, consumed_at
     FROM otp_codes
     WHERE customer_id = $1 AND channel = $2
     ORDER BY created_at DESC LIMIT 1`,
    [customerId, channel]
  );
  const otp = rows[0];
  if (!otp || otp.consumed_at) {
    throw Object.assign(new Error("No pending verification code. Please request a new one."), { status: 400 });
  }
  if (new Date(otp.expires_at).getTime() < Date.now()) {
    throw Object.assign(new Error("This code has expired. Please request a new one."), { status: 400 });
  }
  if (otp.attempts >= otp.max_attempts) {
    throw Object.assign(new Error("Too many incorrect attempts. Please request a new code."), { status: 429 });
  }

  const matches = hashCode(code.trim()) === otp.code_hash;
  if (!matches) {
    await pool.query(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`, [otp.id]);
    return false;
  }

  await pool.query(`UPDATE otp_codes SET consumed_at = now() WHERE id = $1`, [otp.id]);
  return true;
}
