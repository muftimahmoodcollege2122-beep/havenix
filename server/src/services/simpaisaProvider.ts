import crypto from "crypto";
import {
  PaymentProvider,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
  ParsedWebhookEvent,
} from "./paymentProvider";

/**
 * Simpaisa aggregates JazzCash, EasyPaisa, Visa/Mastercard, and IBFT bank transfer
 * behind one merchant integration — https://www.simpaisa.com
 *
 * Confirmed public base URLs (from Simpaisa's published API docs):
 *   Staging:        https://staging.simpaisa.com
 *   Live wallets:   https://wallets.simpaisa.com
 *   Live cards:     https://payment.simpaisa.com
 *   Live DCB:       https://api.simpaisa.com
 *
 * ⚠️ SETUP REQUIRED — READ BEFORE GOING LIVE ⚠️
 * Simpaisa only hands out the exact request/response field names (transaction
 * initiation payload, secure-hash algorithm, webhook payload shape) to onboarded
 * merchants after signup + KYC, via their Postman collection / merchant docs.
 * That contract is NOT public, so it can't be hard-coded here without guessing —
 * guessing on a money-moving integration is how you ship silent bugs.
 *
 * Everything else in this app (order state machine, webhook route, idempotent
 * inventory finalization, checkout UI) is already built and tested against the
 * MockProvider below. Once you have your Simpaisa sandbox credentials + docs:
 *
 *   1. Fill in the request body in `createCheckoutSession()` below to match
 *      their documented initiate-transaction payload.
 *   2. Fill in the HMAC field list in `buildSignaturePayload()` to match their
 *      documented secure-hash spec (which fields, what order, what separator).
 *   3. Fill in the response field names in `parseWebhookPayload()` to match
 *      their documented webhook/postback payload.
 *   4. Set PAYMENT_PROVIDER=simpaisa (instead of "mock") in your environment.
 *
 * Until then, set PAYMENT_PROVIDER=mock and the whole payment flow works
 * end-to-end for building/demoing/testing everything around it.
 */

const STAGING_BASE = "https://staging.simpaisa.com";
const LIVE_WALLETS_BASE = "https://wallets.simpaisa.com";
const LIVE_CARDS_BASE = "https://payment.simpaisa.com";

export class SimpaisaProvider implements PaymentProvider {
  readonly name = "simpaisa";

  private get merchantId() {
    const id = process.env.SIMPAISA_MERCHANT_ID;
    if (!id) throw new Error("SIMPAISA_MERCHANT_ID is not configured");
    return id;
  }

  private get secret() {
    const secret = process.env.SIMPAISA_SECRET;
    if (!secret) throw new Error("SIMPAISA_SECRET is not configured");
    return secret;
  }

  private get baseUrl() {
    if (process.env.SIMPAISA_ENV === "live") {
      // TODO: pick LIVE_WALLETS_BASE vs LIVE_CARDS_BASE depending on `method`
      // once Simpaisa's docs confirm which endpoint each method actually hits.
      return LIVE_CARDS_BASE;
    }
    return STAGING_BASE;
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
    const reference = `HVX-${input.orderId}-${Date.now()}`;

    // TODO — replace this body with Simpaisa's actual documented initiate-transaction
    // payload (exact field names come from their merchant Postman collection).
    // This shape reflects the general pattern used across PK gateways and is a
    // reasonable starting point, but has NOT been verified against Simpaisa's spec.
    const payload = {
      merchant_id: this.merchantId,
      txn_ref: reference,
      amount: input.amount,
      currency: input.currency,
      method: input.method, // jazzcash | easypaisa | card | bank_transfer
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone,
      return_url: input.returnUrl,
      webhook_url: process.env.SIMPAISA_WEBHOOK_URL,
      secure_hash: this.buildSignaturePayload(reference, input.amount, input.currency),
    };

    const response = await fetch(`${this.baseUrl}/api/v1/transactions/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Simpaisa initiate-transaction failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as { redirect_url?: string; checkout_url?: string };
    const redirectUrl = data.redirect_url || data.checkout_url;
    if (!redirectUrl) {
      throw new Error("Simpaisa response did not include a redirect URL — check the response field name");
    }

    return { reference, redirectUrl };
  }

  /** HMAC-SHA256 over the fields Simpaisa's docs specify — field list/order is a TODO. */
  private buildSignaturePayload(reference: string, amount: number, currency: string): string {
    const raw = `${this.merchantId}|${reference}|${amount}|${currency}`;
    return crypto.createHmac("sha256", this.secret).update(raw).digest("hex");
  }

  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): boolean {
    const secret = process.env.SIMPAISA_SECRET;
    if (!secret) return false; // fail closed — never trust an unverifiable webhook

    const signatureHeader = headers["x-simpaisa-signature"]; // TODO: confirm actual header name
    if (!signatureHeader || Array.isArray(signatureHeader)) return false;

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  parseWebhookPayload(rawBody: Buffer): ParsedWebhookEvent {
    const body = JSON.parse(rawBody.toString("utf-8"));
    // TODO — replace with Simpaisa's actual documented webhook field names.
    const reference: string = body.txn_ref || body.reference;
    const providerStatus: string = (body.status || body.txn_status || "").toLowerCase();
    const status = providerStatus === "success" || providerStatus === "paid" ? "success" : providerStatus === "failed" ? "failed" : "pending";
    return {
      reference,
      providerTransactionId: body.provider_txn_id || body.txn_id,
      status,
      raw: body,
    };
  }
}
