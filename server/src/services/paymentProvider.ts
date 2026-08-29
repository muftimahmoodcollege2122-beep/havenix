/**
 * Abstraction over a payment gateway. Any provider (Simpaisa, PayFast, Stripe, etc.)
 * implements this so the rest of the app never depends on gateway-specific shapes.
 */

export type PaymentMethod = "card" | "jazzcash" | "easypaisa" | "bank_transfer";

export interface CreateCheckoutSessionInput {
  orderId: string;
  amount: number; // in PKR, whole rupees (no decimals used in this store)
  currency: string; // "PKR"
  method: PaymentMethod;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  returnUrl: string; // where the gateway sends the customer back to after paying
}

export interface CreateCheckoutSessionResult {
  /** Opaque reference used to reconcile this attempt with webhook events. */
  reference: string;
  /** Where to send the customer's browser to complete payment. */
  redirectUrl: string;
}

export type WebhookEventStatus = "success" | "failed" | "pending";

export interface ParsedWebhookEvent {
  reference: string;
  providerTransactionId?: string;
  status: WebhookEventStatus;
  raw: unknown;
}

export interface PaymentProvider {
  readonly name: string;

  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult>;

  /**
   * Verify the webhook actually came from the provider before trusting its contents.
   * MUST fail closed (return false) if a secret isn't configured — never treat an
   * unverifiable webhook as authentic just because the app is misconfigured.
   */
  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): boolean;

  parseWebhookPayload(rawBody: Buffer): ParsedWebhookEvent;
}
