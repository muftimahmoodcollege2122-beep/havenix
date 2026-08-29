import { Router } from "express";

const router = Router();

router.post("/checkout", (req, res) => {
  const { items, subtotal, shipping, contact, address } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: "Cart is empty" });
  if (!contact?.email || !contact?.fullName) return res.status(400).json({ error: "Contact info required" });
  if (!address?.fullAddress || !address?.city) return res.status(400).json({ error: "Delivery address required" });

  const orderId = `HV-${Math.floor(10000 + Math.random() * 89999)}`;
  const total = subtotal + shipping;
  res.status(201).json({
    orderId,
    status: "Order Placed",
    placedOn: new Date().toISOString().slice(0, 10),
    estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    trackingNumber: String(Math.floor(1000000000 + Math.random() * 8999999999)),
    total,
  });
});

export default router;
