import express from "express";
import cors from "cors";
import catalogRoutes from "./routes/catalog";
import cartRoutes from "./routes/cart";
import accountRoutes from "./routes/account";
import checkoutRoutes from "./routes/checkout";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import paymentsRoutes from "./routes/payments";
import uploadsRoutes from "./routes/uploads";
import contactRoutes from "./routes/contact";
import reviewsRoutes from "./routes/reviews";
import { pool } from "./db/pool";

const app = express();
app.use(cors());

// Webhook needs the raw body to verify the gateway's signature — must be mounted
// with express.raw() BEFORE the global express.json() parser consumes the stream.
app.post("/api/payments/webhook", express.raw({ type: "*/*" }));

app.use(express.json());

app.use("/api", catalogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", accountRoutes);
app.use("/api", checkoutRoutes);
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", paymentsRoutes);
app.use("/api", uploadsRoutes);
app.use("/api", contactRoutes);
app.use("/api", reviewsRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    res.status(503).json({ ok: false, db: "unreachable" });
  }
});

// Any request that didn't match a real route (typo'd path, stray slash from a
// misconfigured NEXT_PUBLIC_API_URL, wrong method, etc.) gets JSON back — never
// Express's default HTML 404 page, which is what turns into a confusing
// "Unexpected token '<'" error on the client.
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// Catches multer (file upload) errors and any other thrown middleware errors
// so the client always gets JSON back instead of a raw HTML error page.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Image is too large (8MB max)." });
  }
  const status = err.status || (err.message?.includes("Only image files") ? 400 : 500);
  res.status(status).json({ error: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Havenix API running on :${PORT}`);
  console.log(`Payment provider: ${process.env.PAYMENT_PROVIDER || "mock"}`);
  pool
    .query("SELECT 1")
    .then(() => console.log("Database connected."))
    .catch((err) => console.error("Database connection failed:", err.message));
});
