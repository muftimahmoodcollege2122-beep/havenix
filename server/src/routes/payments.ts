import { Router } from "express";
import { getPaymentProvider } from "../services/paymentProviderFactory";
import { MockProvider } from "../services/mockProvider";
import {
  priceItems,
  computeShipping,
  createPendingOrder,
  recordCheckoutAttempt,
  findOrderByReference,
  finalizeOrderPayment,
  failOrderPayment,
  getOrderPaymentStatus,
  clearCart,
} from "../data/paymentsRepo";
import type { PaymentMethod } from "../services/paymentProvider";

const router = Router();

// ── Start a payment: re-prices from DB, creates an unpaid order, gets a redirect URL ──
router.post("/payments/checkout", async (req, res) => {
  try {
    const { cartId, items, contact, address, method } = req.body as {
      cartId?: string;
      items: { sku: string; qty: number }[];
      contact: { email: string; fullName: string; phone?: string };
      address: { country?: string; fullAddress: string; apartment?: string; city: string; postalCode?: string };
      method: PaymentMethod;
    };

    if (!items?.length) return res.status(400).json({ error: "Cart is empty" });
    if (!contact?.email || !contact?.fullName) return res.status(400).json({ error: "Contact info required" });
    if (!address?.fullAddress || !address?.city) return res.status(400).json({ error: "Delivery address required" });
    if (!["card", "jazzcash", "easypaisa", "bank_transfer"].includes(method)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const { lines, subtotal } = await priceItems(items);
    for (const line of lines) {
      if (line.inventory < line.qty) {
        return res.status(400).json({ error: `Insufficient inventory for ${line.name}` });
      }
    }
    const shipping = computeShipping(subtotal);

    const { orderId, paymentId, total } = await createPendingOrder({
      contact,
      address,
      method,
      lines,
      subtotal,
      shipping,
    });

    const provider = getPaymentProvider();
    const returnUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/payments/return?orderId=${orderId}`;

    const session = await provider.createCheckoutSession({
      orderId,
      amount: total,
      currency: "PKR",
      method,
      customer: { name: contact.fullName, email: contact.email, phone: contact.phone },
      returnUrl,
    });

    await recordCheckoutAttempt(paymentId, session.reference);
    await clearCart(cartId);

    res.status(201).json({ orderId, redirectUrl: session.redirectUrl });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to start payment" });
  }
});

// ── Gateway webhook: the only source of truth for "was this actually paid" ──
router.post("/payments/webhook", async (req, res) => {
  try {
    const provider = getPaymentProvider();
    const rawBody: Buffer = req.body; // mounted with express.raw() in index.ts

    if (!provider.verifyWebhookSignature(rawBody, req.headers)) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    const event = provider.parseWebhookPayload(rawBody);
    const match = await findOrderByReference(event.reference);
    if (!match) {
      console.warn(`Webhook for unknown reference: ${event.reference}`);
      return res.status(404).json({ error: "Unknown reference" });
    }

    if (event.status === "success") {
      const result = await finalizeOrderPayment(match.orderId, event.providerTransactionId);
      if (!result.ok) console.error(`Failed to finalize order ${match.orderId}: ${result.reason}`);
    } else if (event.status === "failed") {
      await failOrderPayment(match.orderId);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// ── Frontend polls this after the gateway redirects the customer back ──
router.get("/payments/status/:orderId", async (req, res) => {
  try {
    const status = await getOrderPaymentStatus(req.params.orderId);
    if (!status) return res.status(404).json({ error: "Order not found" });
    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load status" });
  }
});

// ── Dev-only: simulates the mock gateway's own server calling our webhook ──
router.post("/payments/mock-complete", async (req, res) => {
  const provider = getPaymentProvider();
  if (!(provider instanceof MockProvider)) {
    return res.status(400).json({ error: "Mock completion is only available when PAYMENT_PROVIDER=mock" });
  }
  const { reference, outcome } = req.body as { reference: string; outcome: "success" | "failed" };
  const match = await findOrderByReference(reference);
  if (!match) return res.status(404).json({ error: "Unknown reference" });

  if (outcome === "success") {
    const result = await finalizeOrderPayment(match.orderId);
    if (!result.ok) return res.status(400).json({ error: result.reason });
  } else {
    await failOrderPayment(match.orderId);
  }
  res.json({ ok: true });
});

export default router;
