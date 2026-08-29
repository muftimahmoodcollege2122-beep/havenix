import express from "express";
import cors from "cors";
import catalogRoutes from "./routes/catalog";
import cartRoutes from "./routes/cart";
import accountRoutes from "./routes/account";
import checkoutRoutes from "./routes/checkout";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", catalogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", accountRoutes);
app.use("/api", checkoutRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Havenix API running on :${PORT}`));
