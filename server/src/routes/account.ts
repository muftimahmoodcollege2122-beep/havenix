import { Router } from "express";
import { pool } from "../db/pool";
import { sizeGuides, recommendSize } from "../data/sizeGuide";

const router = Router();

// Single-tenant demo: always resolve the first seeded customer.
async function getDemoCustomerId() {
  const { rows } = await pool.query("SELECT id FROM customers ORDER BY created_at LIMIT 1");
  return rows[0]?.id || null;
}

router.get("/account", async (_req, res) => {
  try {
    const customerId = await getDemoCustomerId();
    if (!customerId) return res.status(404).json({ error: "No customer found" });

    const { rows: custRows } = await pool.query("SELECT id, name, email FROM customers WHERE id = $1", [customerId]);
    const { rows: children } = await pool.query(
      `SELECT id, name, age_years AS "ageYears", height_cm AS "heightCm", weight_kg AS "weightKg"
       FROM children WHERE customer_id = $1 ORDER BY created_at`,
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
      childProfiles: children,
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
  const { heightCm, ageYears } = req.body as { heightCm: number; ageYears: number };
  res.json(recommendSize(heightCm, ageYears));
});

export default router;
