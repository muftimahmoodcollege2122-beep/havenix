import express from "express";
import cors from "cors";
import catalogRoutes from "./routes/catalog";
import cartRoutes from "./routes/cart";
import accountRoutes from "./routes/account";
import checkoutRoutes from "./routes/checkout";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import paymentsRoutes from "./routes/payments";
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

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    res.status(503).json({ ok: false, db: "unreachable" });
  }
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
