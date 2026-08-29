import { Router } from "express";
import { products, findProduct } from "../data/products";

const router = Router();

router.get("/products", (req, res) => {
  const { category, sort } = req.query as { category?: string; sort?: string };
  let list = [...products];
  if (category) list = list.filter((p) => p.category === category);
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  res.json(list);
});

router.get("/products/:slug", (req, res) => {
  const product = findProduct(req.params.slug);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  res.json({ product, related });
});

router.get("/search", (req, res) => {
  const q = ((req.query.q as string) || "").toLowerCase().trim();
  if (!q) return res.json([]);
  const terms = q.split(/\s+/);
  const results = products.filter((p) => {
    const haystack = `${p.name} ${p.category} ${p.subCategory}`.toLowerCase();
    return terms.some((t) => haystack.includes(t));
  });
  res.json(results);
});

export default router;
