import { Router } from "express";
import multer from "multer";
import { adminAuth, ADMIN_KEY } from "../middleware/adminAuth";
import { pool } from "../db/pool";
import {
  listAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  updateVariantInventory,
  ProductInput,
} from "../data/adminRepo";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per image
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

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

router.post("/admin/uploads", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No image file provided" });

    const { rows } = await pool.query(
      `INSERT INTO admin_uploads (data, mime_type, size_bytes) VALUES ($1,$2,$3) RETURNING id`,
      [file.buffer, file.mimetype, file.size]
    );
    res.status(201).json({ id: rows[0].id, url: `/api/uploads/${rows[0].id}` });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

export default router;
