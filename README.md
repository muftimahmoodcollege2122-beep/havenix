# Havenix — Apparel E-commerce

Full-stack build: Next.js (App Router) storefront + admin panel, Node.js + TypeScript (Express)
backend, PostgreSQL database. Departments: Women, Men, Kids, Accessories. Real customer auth,
real payment checkout (JazzCash, EasyPaisa, card, bank transfer, COD, plus a mock gateway for
local dev), and an admin panel for managing the catalog and stock.

## Structure

```
havenix/
├── web/        Next.js (App Router) — storefront + admin panel
└── server/     Node.js + TypeScript + Express + PostgreSQL (pg)
```

The storefront was originally a Vite SPA (`client/`); it has been fully migrated to Next.js
for server-rendered pages, per-page metadata, and a real sitemap. `client/` has been removed.

## Database

Postgres schema lives in `server/src/db/` as two migration files, applied in order by
`npm run db:migrate`:

- `schema.sql` — core entities: customers, addresses, products, product_images, product_variants,
  carts, cart_items, orders, order_items
- `002_full_schema.sql` — everything since: extended commerce schema (inventory, promotions,
  reviews, etc.), payment status/method tracking, customer auth fields, admin image uploads,
  contact messages, and email/SMS verification. Was originally split across `002`–`009`; merged
  into one file since every statement in it is idempotent (`IF NOT EXISTS` / safe `ALTER`), so
  consolidating changes nothing about what a fresh or already-migrated database ends up with.

Checkout runs inside a DB transaction: locks the variant rows, checks stock, inserts the order,
decrements inventory, and clears the cart — or rolls back entirely on any failure. The
gateway-payment flow (`/api/payments/*`) creates the order as `unpaid` first and only decrements
stock once the provider confirms payment (webhook or, in dev, the mock-complete endpoint).

## Run locally

1. Have a PostgreSQL server running (locally or hosted). Create a database:
   ```
   createdb havenix
   ```
2. Backend (port 4000):
   ```
   cd server
   npm install
   export DATABASE_URL="postgresql://user:password@localhost:5432/havenix"
   npm run db:migrate   # creates/updates tables
   npm run db:seed      # loads demo products/customer/orders
   npm run dev
   ```
3. Frontend (Next.js, port 3000):
   ```
   cd web
   cp .env.example .env.local   # point at the API from step 2
   npm install
   npm run dev
   ```

Open http://localhost:3000. Admin panel is at `/admin/login` (key set via `ADMIN_KEY` on the
server).

## Backend API

**Catalog / cart / orders**
- `GET  /api/products?category=women|men|kids|accessories`
- `GET  /api/products/:slug`
- `GET  /api/search?q=dress`
- `GET  /api/cart/:cartId`
- `POST /api/cart/:cartId/items` · `PATCH /api/cart/:cartId/items/:sku` · `DELETE /api/cart/:cartId/items/:sku`
- `GET  /api/orders/:id`
- `GET  /api/size-guide` · `POST /api/size-recommendation`
- `POST /api/checkout` — cash-on-delivery / legacy direct-order path
- `GET  /api/health`

**Customer auth** (JWT, `Authorization: Bearer <token>`)
- `POST /api/auth/signup` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET  /api/account` (requires auth)

**Payments** (real gateway checkout)
- `POST /api/payments/checkout` — creates an unpaid order + starts a JazzCash/EasyPaisa/card/bank
  transfer session
- `GET  /api/payments/status/:orderId`
- `POST /api/payments/webhook` — provider confirms payment (raw body, signature-verified)
- `POST /api/payments/mock-complete` — dev-only stand-in for the webhook when `PAYMENT_PROVIDER=mock`

**Admin** (`x-admin-key` header, see `ADMIN_KEY` env var)
- `POST /api/admin/login`
- `GET  /api/admin/products` · `POST /api/admin/products` · `DELETE /api/admin/products/:id`
- `PATCH /api/admin/variants/:sku/inventory`
- `POST /api/admin/uploads` — multipart image upload (max 8MB, image types only)
- `GET  /api/uploads/:id` — serves an uploaded image (public, cached)

## Deploy

**Backend — Railway.** Root Directory: `server`. Provision a Postgres plugin, set `DATABASE_URL`
(link to the plugin), `ADMIN_KEY`, `JWT_SECRET`, `CLIENT_URL` (must point at the deployed `web/`
app — payment redirects are built from it), and payment provider vars if not using the mock
provider. `railway.json`'s start command runs migrate + seed + start automatically.

**Frontend — Vercel (recommended) or any Next.js host.** Root Directory: `web`. Set:
- `API_URL` — server URL, used for SSR fetches
- `NEXT_PUBLIC_API_URL` — server URL, used for browser fetches
- `NEXT_PUBLIC_SITE_URL` — this app's own public URL, used for sitemap/canonical tags

See `web/README.md` for more detail on the Next.js migration and structure.

## Notes

- Cart is tracked via a client-generated ID in localStorage; works for guests, and links to the
  logged-in customer at checkout when authenticated.
- Seed data includes SKUs with 0 inventory intentionally, to exercise out-of-stock handling.
- Product images: admin-uploaded ones are stored as binary data in Postgres and served via
  `/api/uploads/:id`; external URLs are also supported.
