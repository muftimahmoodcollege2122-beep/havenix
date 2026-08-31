import bcrypt from "bcryptjs";
import { pool } from "../db/pool";

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  marketingOptIn: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export async function signupCustomer(name: string, email: string, password: string, phone?: string) {
  const { rows: existing } = await pool.query("SELECT id FROM customers WHERE email = $1", [
    email.toLowerCase().trim(),
  ]);
  if (existing.length > 0) {
    throw Object.assign(new Error("An account with this email already exists."), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO customers (name, email, password_hash, phone)
     VALUES ($1,$2,$3,$4)
     RETURNING id, name, email, phone, marketing_opt_in AS "marketingOptIn",
               email_verified AS "emailVerified", phone_verified AS "phoneVerified"`,
    [name.trim(), email.toLowerCase().trim(), passwordHash, phone || null]
  );
  return rows[0] as CustomerProfile;
}

export async function loginCustomer(email: string, password: string) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, password_hash AS "passwordHash", marketing_opt_in AS "marketingOptIn",
            email_verified AS "emailVerified", phone_verified AS "phoneVerified"
     FROM customers WHERE email = $1`,
    [email.toLowerCase().trim()]
  );
  const row = rows[0];
  if (!row || !row.passwordHash) {
    throw Object.assign(new Error("Invalid email or password."), { status: 401 });
  }
  const valid = await bcrypt.compare(password, row.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("Invalid email or password."), { status: 401 });
  }
  const { passwordHash, ...profile } = row;
  return profile as CustomerProfile;
}

export async function getCustomerProfile(id: string): Promise<CustomerProfile | null> {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, marketing_opt_in AS "marketingOptIn",
            email_verified AS "emailVerified", phone_verified AS "phoneVerified"
     FROM customers WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function markEmailVerified(id: string) {
  await pool.query(`UPDATE customers SET email_verified = true WHERE id = $1`, [id]);
}

export async function markPhoneVerified(id: string, phone?: string) {
  if (phone) {
    await pool.query(`UPDATE customers SET phone = $2, phone_verified = true WHERE id = $1`, [id, phone]);
  } else {
    await pool.query(`UPDATE customers SET phone_verified = true WHERE id = $1`, [id]);
  }
}

export async function updateCustomerContact(id: string, patch: { phone?: string | null; name?: string }) {
  await pool.query(
    `UPDATE customers SET
       phone = COALESCE($2, phone),
       name = COALESCE($3, name)
     WHERE id = $1`,
    [id, patch.phone ?? null, patch.name ?? null]
  );
}

/**
 * Queues a notification tied to the customer's full contact details.
 * No live email/SMS provider is wired up yet — this persists the record so a
 * future sending job (or provider integration) can pick it up and dispatch it.
 */
export async function queueNotification(
  customerId: string | null,
  channel: "email" | "sms",
  code: string,
  payload: Record<string, unknown>
) {
  await pool.query(
    `INSERT INTO notifications (customer_id, channel, status, sent_at)
     VALUES ($1, $2, 'pending', NULL)`,
    [customerId, channel]
  );
  // `code`/`payload` are kept for when a template-rendering + delivery worker is added.
  void code;
  void payload;
}
