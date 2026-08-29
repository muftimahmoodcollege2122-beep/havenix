import { Router } from "express";
import { products } from "../data/products";

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

const carts = new Map<string, CartLine[]>();

function getCart(id: string): CartLine[] {
  if (!carts.has(id)) carts.set(id, []);
  return carts.get(id)!;
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

const router = Router();

router.get("/:cartId", (req, res) => {
  res.json(summarize(getCart(req.params.cartId)));
});

router.post("/:cartId/items", (req, res) => {
  const { productId, sku, qty = 1 } = req.body as { productId: string; sku: string; qty?: number };
  const product = products.find((p) => p.id === productId);
  const variant = product?.variants.find((v) => v.sku === sku);
  if (!product || !variant) return res.status(404).json({ error: "Product or variant not found" });
  if (variant.inventory < qty) return res.status(400).json({ error: "Insufficient inventory" });

  const lines = getCart(req.params.cartId);
  const existing = lines.find((l) => l.sku === sku);
  if (existing) {
    existing.qty += qty;
  } else {
    lines.push({
      sku,
      productId: product.id,
      name: product.name,
      image: product.images[0],
      color: variant.color,
      size: variant.size,
      price: product.price,
      qty,
    });
  }
  res.status(201).json(summarize(lines));
});

router.patch("/:cartId/items/:sku", (req, res) => {
  const { qty } = req.body as { qty: number };
  const lines = getCart(req.params.cartId);
  const line = lines.find((l) => l.sku === req.params.sku);
  if (!line) return res.status(404).json({ error: "Line not found" });
  if (qty <= 0) {
    const idx = lines.indexOf(line);
    lines.splice(idx, 1);
  } else {
    line.qty = qty;
  }
  res.json(summarize(lines));
});

router.delete("/:cartId/items/:sku", (req, res) => {
  const lines = getCart(req.params.cartId);
  const idx = lines.findIndex((l) => l.sku === req.params.sku);
  if (idx >= 0) lines.splice(idx, 1);
  res.json(summarize(lines));
});

export default router;
