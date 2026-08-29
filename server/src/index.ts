import express from "express";
import cors from "cors";
import catalogRoutes from "./routes/catalog";
import cartRoutes from "./routes/cart";
import accountRoutes from "./routes/account";
import checkoutRoutes from "./routes/checkout";
import adminRoutes from "./routes/admin";
import { pool } from "./db/pool";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", catalogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", accountRoutes);
app.use("/api", checkoutRoutes);
app.use("/api", adminRoutes);

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
  pool
    .query("SELECT 1")
    .then(() => console.log("Database connected."))
    .catch((err) => console.error("Database connection failed:", err.message));
});
