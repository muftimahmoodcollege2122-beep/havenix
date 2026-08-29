import { Router } from "express";
import { pool } from "../db/pool";
import { sizeGuides, recommendSize } from "../data/sizeGuide";
import { requireCustomer } from "../middleware/customerAuth";

const router = Router();

router.get("/account", requireCustomer, async (req, res) => {
  try {
    const customerId = req.customerId!;

    const { rows: custRows } = await pool.query("SELECT id, name, email, phone FROM customers WHERE id = $1", [customerId]);
    if (!custRows[0]) return res.status(404).json({ error: "Account not found" });
    const { rows: familyProfiles } = await pool.query(
      `SELECT id, name, department, age_years AS "ageYears", height_cm AS "heightCm", weight_kg AS "weightKg"
       FROM family_profiles WHERE customer_id = $1 ORDER BY created_at`,
      [customerId]
    );
    const { rows: orders } = await pool.query(
      `SELECT o.id, o.status, o.subtotal, o.shipping, o.total, o.tracking_number AS "trackingNumber",
              o.estimated_delivery AS "estimatedDelivery", o.placed_on AS "placedOn",
              COALESCE(
                (SELECT json_agg(json_build_object(
                  'sku', oi.sku, 'name', oi.name, 'color', oi.color, 'size', oi.size,
                  'price', oi.price, 'qty', oi.qty, 'image', oi.image
                )) FROM order_items oi WHERE oi.order_id = o.id),
                '[]'
              ) AS items
       FROM orders o WHERE o.customer_id = $1 ORDER BY o.placed_on DESC`,
      [customerId]
    );

    res.json({
      customer: custRows[0],
      familyProfiles,
      orders,
      stats: {
        totalOrders: orders.length,
        wishlistItems: 2,
        activeReturns: 1,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load account" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.id, o.status, o.subtotal, o.shipping, o.total, o.tracking_number AS "trackingNumber",
              o.estimated_delivery AS "estimatedDelivery", o.placed_on AS "placedOn",
              COALESCE(
                (SELECT json_agg(json_build_object(
                  'sku', oi.sku, 'name', oi.name, 'color', oi.color, 'size', oi.size,
                  'price', oi.price, 'qty', oi.qty, 'image', oi.image
                )) FROM order_items oi WHERE oi.order_id = o.id),
                '[]'
              ) AS items
       FROM orders o WHERE o.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Order not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load order" });
  }
});

router.get("/size-guide", (_req, res) => {
  res.json(sizeGuides);
});

router.post("/size-recommendation", (req, res) => {
  const { heightCm, department } = req.body as {
    heightCm: number;
    department?: "women" | "men" | "kids";
  };
  res.json(recommendSize(heightCm, department));
});

export default router;
