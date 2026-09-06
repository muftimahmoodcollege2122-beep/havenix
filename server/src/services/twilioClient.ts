/**
 * Thin wrapper around Twilio for order notifications (distinct from
 * smsProvider.ts, which is scoped to OTP codes only).
 *
 * Sends over WhatsApp by default (cheaper and more commonly used in
 * Pakistan than SMS), with a real, working Twilio integration — this one
 * IS fully wired, not stubbed, since Twilio's REST API contract is stable
 * and well-documented (unlike the local payment gateways discussed
 * earlier, which required merchant-specific docs we didn't have).
 *
 * Setup to go live:
 *   1. Get a Twilio account: https://www.twilio.com/console
 *   2. For WhatsApp: join/configure the WhatsApp sandbox (or get an
 *      approved WhatsApp sender for production) — Twilio gives you a
 *      "from" number like "whatsapp:+14155238886"
 *   3. Set env vars:
 *        NOTIFICATIONS_ENABLED=true
 *        TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *        TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *        TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
 *        ADMIN_NOTIFY_PHONE=+92xxxxxxxxxx   (your own phone, gets new-order alerts)
 *
 * Until NOTIFICATIONS_ENABLED=true and credentials are set, every call
 * just logs to the console — safe by default, nothing sends until you
 * deliberately turn it on.
 */

interface SendResult {
  sent: boolean;
  skipped: boolean;
  reason?: string;
}

function isConfigured() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env;
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM);
}

function enabled() {
  return process.env.NOTIFICATIONS_ENABLED === "true";
}

/** Normalizes a phone number to E.164-ish shape for the whatsapp: prefix. Best-effort only. */
function toWhatsAppAddress(phone: string): string {
  const trimmed = phone.trim();
  return trimmed.startsWith("whatsapp:") ? trimmed : `whatsapp:${trimmed}`;
}

export async function sendWhatsApp(toPhone: string, message: string): Promise<SendResult> {
  if (!enabled()) {
    console.log(`\n[notify:disabled] Would send WhatsApp to ${toPhone}:\n${message}\n`);
    return { sent: false, skipped: true, reason: "NOTIFICATIONS_ENABLED is not true" };
  }
  if (!isConfigured()) {
    console.log(`\n[notify:unconfigured] Would send WhatsApp to ${toPhone}:\n${message}\n`);
    return { sent: false, skipped: true, reason: "Twilio credentials are not set" };
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env as Record<string, string>;

  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      to: toWhatsAppAddress(toPhone),
      from: TWILIO_WHATSAPP_FROM,
      body: message,
    });
    return { sent: true, skipped: false };
  } catch (err) {
    console.error("Twilio WhatsApp send failed:", err);
    return { sent: false, skipped: false, reason: err instanceof Error ? err.message : "Unknown Twilio error" };
  }
}
