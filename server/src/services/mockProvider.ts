import crypto from "crypto";
import {
  PaymentProvider,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
  ParsedWebhookEvent,
} from "./paymentProvider";

/**
 * Simulates a payment gateway entirely in-app: no external calls, no real money.
 * Redirects the customer straight to a mock hosted-payment page (built into this
 * app) where they can simulate "Pay Successfully" or "Payment Failed", which then
 * fires the same webhook path a real gateway would. This exercises the entire
 * order/payment state machine end-to-end without needing live credentials.
 *
 * Switch PAYMENT_PROVIDER=simpaisa once real credentials + API docs are wired up
 * in simpaisaProvider.ts — no other code needs to change.
 */
export class MockProvider implements PaymentProvider {
  readonly name = "mock";

  private get secret() {
    return process.env.MOCK_PAYMENT_SECRET || "mock-dev-secret";
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
    const reference = `MOCK-${input.orderId}-${Date.now()}`;
    const params = new URLSearchParams({
      reference,
      orderId: input.orderId,
      amount: String(input.amount),
      method: input.method,
      returnUrl: input.returnUrl,
    });
    // The client app renders a simple "mock gateway" screen at this route.
    const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/payments/mock-gateway?${params.toString()}`;
    return { reference, redirectUrl };
  }

  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): boolean {
    const signatureHeader = headers["x-mock-signature"];
    if (!signatureHeader || Array.isArray(signatureHeader)) return false;
    const expected = crypto.createHmac("sha256", this.secret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  parseWebhookPayload(rawBody: Buffer): ParsedWebhookEvent {
    const body = JSON.parse(rawBody.toString("utf-8"));
    return {
      reference: body.reference,
      providerTransactionId: body.providerTransactionId,
      status: body.status,
      raw: body,
    };
  }
}
