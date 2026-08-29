import { Router } from "express";
import { listProducts, getProductBySlug, getRelatedProducts, searchProducts } from "../data/productRepo";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const { category, sort } = req.query as { category?: string; sort?: string };
    const list = await listProducts(category, sort);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

router.get("/products/:slug", async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const related = await getRelatedProducts(product.category, product.id, 4);
    res.json({ product, related });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load product" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    if (!q.trim()) return res.json([]);
    const results = await searchProducts(q);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
