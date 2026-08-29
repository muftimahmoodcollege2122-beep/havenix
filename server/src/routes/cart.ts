import { Router } from "express";
import { pool } from "../db/pool";
import { getVariantBySku } from "../data/productRepo";

interface CartLine {
  sku: string;
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  qty: number;
}

function summarize(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const shipping = subtotal >= 10000 || subtotal === 0 ? 0 : 700;
  const freeShippingRemaining = Math.max(0, 10000 - subtotal);
  return {
    items: lines,
    itemCount: lines.reduce((n, l) => n + l.qty, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
    freeShippingRemaining,
  };
}

async function ensureCart(cartId: string) {
  await pool.query(
    `INSERT INTO carts (id) VALUES ($1) ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
    [cartId]
  );
}

async function loadCartLines(cartId: string): Promise<CartLine[]> {
  const { rows } = await pool.query(
    `SELECT ci.sku, ci.qty, p.id AS "productId", p.name, p.price, pv.color, pv.size,
       (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position LIMIT 1) AS image
     FROM cart_items ci
     JOIN product_variants pv ON pv.sku = ci.sku
     JOIN products p ON p.id = pv.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id`,
    [cartId]
  );
  return rows;
}

const router = Router();

router.get("/:cartId", async (req, res) => {
  try {
    const lines = await loadCartLines(req.params.cartId);
    res.json(summarize(lines));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load cart" });
  }
});

router.post("/:cartId/items", async (req, res) => {
  const { cartId } = req.params;
  const { productId, sku, qty = 1 } = req.body as { productId: string; sku: string; qty?: number };
  try {
    const variant = await getVariantBySku(sku);
    if (!variant || variant.product_id !== productId) {
      return res.status(404).json({ error: "Product or variant not found" });
    }
    if (variant.inventory < qty) {
      return res.status(400).json({ error: "Insufficient inventory" });
    }

    await ensureCart(cartId);
    await pool.query(
      `INSERT INTO cart_items (cart_id, sku, qty) VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, sku) DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty`,
      [cartId, sku, qty]
    );

    const lines = await loadCartLines(cartId);
    res.status(201).json(summarize(lines));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

router.patch("/:cartId/items/:sku", async (req, res) => {
  const { cartId, sku } = req.params;
  const { qty } = req.body as { qty: number };
  try {
    if (qty <= 0) {
      await pool.query("DELETE FROM cart_items WHERE cart_id = $1 AND sku = $2", [cartId, sku]);
    } else {
      const result = await pool.query(
        "UPDATE cart_items SET qty = $1 WHERE cart_id = $2 AND sku = $3",
        [qty, cartId, sku]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: "Line not found" });
    }
    const lines = await loadCartLines(cartId);
    res.json(summarize(lines));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

router.delete("/:cartId/items/:sku", async (req, res) => {
  const { cartId, sku } = req.params;
  try {
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1 AND sku = $2", [cartId, sku]);
    const lines = await loadCartLines(cartId);
    res.json(summarize(lines));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove item" });
  }
});

export default router;
