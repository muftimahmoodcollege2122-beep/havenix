import { Router } from "express";
import { customer, childProfiles, orders } from "../data/account";
import { sizeGuides, recommendSize } from "../data/sizeGuide";

const router = Router();

router.get("/account", (req, res) => {
  res.json({
    customer,
    childProfiles,
    orders,
    stats: {
      totalOrders: orders.length,
      wishlistItems: 2,
      activeReturns: 1,
    },
  });
});

router.get("/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

router.get("/size-guide", (req, res) => {
  res.json(sizeGuides);
});

router.post("/size-recommendation", (req, res) => {
  const { heightCm, ageYears } = req.body as { heightCm: number; ageYears: number };
  res.json(recommendSize(heightCm, ageYears));
});

export default router;
