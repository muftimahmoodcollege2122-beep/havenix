import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
import { INSECURE_DEFAULT_JWT_SECRET } from "./lib/jwt";
import { INSECURE_DEFAULT_ADMIN_KEY } from "./middleware/adminAuth";

const app = express();

// Standard security headers (CSP, X-Frame-Options, HSTS, etc). This API only
// ever returns JSON/images, never HTML, so the default CSP is harmless here —
// but crossOriginResourcePolicy needs relaxing since product images at
// /api/uploads/:id are legitimately loaded by a different origin (the storefront).
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Only requests from known frontend origins are allowed. CORS_ORIGINS accepts a
// comma-separated list for supporting multiple domains (e.g. a Vercel/Railway
// URL plus a custom domain); falls back to CLIENT_URL if that's the only one set.
// Requests with no Origin header (server-to-server calls, payment webhooks,
// curl/Postman) are always allowed through, since Origin doesn't apply to them.
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .concat(["http://localhost:3000"]); // local frontend dev server

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(Object.assign(new Error(`Origin ${origin} is not allowed by CORS`), { status: 403 }));
    },
    credentials: true,
  })
);

// Baseline abuse protection on every /api route, plus tighter limits on the
// specific endpoints most worth protecting (auth, OTP, admin login) below.
// Standard headers report the limit/remaining/reset via RateLimit-* headers.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes and try again." },
});
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes and try again." },
});

app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/verify", authLimiter);
app.use("/api/admin/login", adminLoginLimiter);

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
  checkClientUrlConfig();
  checkSecretsConfig();
  pool
    .query("SELECT 1")
    .then(() => console.log("Database connected."))
    .catch((err) => console.error("Database connection failed:", err.message));
});

/**
 * CLIENT_URL drives payment-provider redirects (see routes/payments.ts). If it's
 * missing, still a placeholder, or pointed at an old/dead deployment, checkout
 * silently sends real customers to the wrong place after paying — with no error
 * anywhere, since nothing throws. This just makes that misconfiguration loud in
 * the deploy logs instead of silent in production.
 */
function checkClientUrlConfig() {
  const url = process.env.CLIENT_URL;
  if (!url) {
    console.warn(
      "⚠️  CLIENT_URL is not set. Payment-provider redirects will fall back to a default " +
        "that is almost certainly wrong in production. Set CLIENT_URL to the storefront's " +
        "real public URL (the one customers actually browse)."
    );
    return;
  }
  try {
    const parsed = new URL(url);
    // A bare, short "*.railway.app" host (no "up." prefix, no "-production-<hash>"
    // suffix) doesn't match Railway's current domain format for a live service —
    // it's a common sign of a stale/legacy domain left over from a deleted service.
    const looksLegacyRailway =
      parsed.hostname.endsWith(".railway.app") &&
      !parsed.hostname.endsWith(".up.railway.app");
    if (looksLegacyRailway) {
      console.warn(
        `⚠️  CLIENT_URL is set to "${url}", which doesn't match Railway's current domain ` +
          `format (expected something ending in ".up.railway.app"). Double-check this isn't ` +
          `pointing at an old, deleted, or orphaned deployment before relying on it for ` +
          `payment redirects.`
      );
    } else {
      console.log(`CLIENT_URL: ${url}`);
    }
  } catch {
    console.warn(`⚠️  CLIENT_URL ("${url}") is not a valid URL.`);
  }
}

/**
 * JWT_SECRET signs every customer login token; ADMIN_KEY gates the entire admin
 * panel. Both fall back to a hardcoded value if unset — fine for local dev, but
 * those exact defaults are now public in this repo's git history, so leaving
 * them unset in production means tokens/admin access can be trivially forged.
 */
function checkSecretsConfig() {
  if ((process.env.JWT_SECRET || INSECURE_DEFAULT_JWT_SECRET) === INSECURE_DEFAULT_JWT_SECRET) {
    console.warn(
      "🚨 JWT_SECRET is not set — customer login tokens are being signed with a default " +
        "value that is public in this repo. Set JWT_SECRET to a long random string in Railway " +
        "immediately; anyone can forge a valid login token until you do."
    );
  }
  if ((process.env.ADMIN_KEY || INSECURE_DEFAULT_ADMIN_KEY) === INSECURE_DEFAULT_ADMIN_KEY) {
    console.warn(
      "🚨 ADMIN_KEY is not set — the admin panel is protected by a default value that is " +
        "public in this repo. Set ADMIN_KEY to a strong, unique value in Railway immediately; " +
        "anyone can log into /admin until you do."
    );
  }
}
