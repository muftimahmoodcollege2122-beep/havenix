import { Router } from "express";
import { adminAuth, ADMIN_KEY } from "../middleware/adminAuth";
import {
  listAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  updateVariantInventory,
  ProductInput,
} from "../data/adminRepo";

const router = Router();

router.post("/admin/login", (req, res) => {
  const { key } = req.body as { key?: string };
  if (key && key === ADMIN_KEY) {
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: "Invalid admin key" });
});

router.use("/admin", adminAuth);

router.get("/admin/products", async (_req, res) => {
  try {
    const products = await listAllProductsAdmin();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

router.post("/admin/products", async (req, res) => {
  try {
    const input = req.body as ProductInput;
    if (!input.name || !input.category || !input.price) {
      return res.status(400).json({ error: "name, category, and price are required" });
    }
    const product = await createProduct(input);
    res.status(201).json(product);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to create product" });
  }
});

router.put("/admin/products/:id", async (req, res) => {
  try {
    const input = req.body as ProductInput;
    const product = await updateProduct(req.params.id, input);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to update product" });
  }
});

router.delete("/admin/products/:id", async (req, res) => {
  try {
    const ok = await deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.patch("/admin/variants/:sku/inventory", async (req, res) => {
  try {
    const { inventory } = req.body as { inventory: number };
    if (typeof inventory !== "number" || inventory < 0) {
      return res.status(400).json({ error: "inventory must be a non-negative number" });
    }
    const ok = await updateVariantInventory(req.params.sku, inventory);
    if (!ok) return res.status(404).json({ error: "Variant not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

export default router;
