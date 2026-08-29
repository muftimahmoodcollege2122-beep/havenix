# Havenix — Children's Fashion E-commerce

Full-stack build: React + TypeScript (Vite) frontend, Node.js + TypeScript (Express) backend,
PostgreSQL database. Matches the 10-page Havenix mockups: Homepage, Collection (Girls/Boys/Baby),
Product, Cart, Checkout, Search, Account Dashboard, Size Guide/Child Profile, Order Tracking, Footer.

## Structure

```
havenix/
├── client/     React + TypeScript + Tailwind (Vite)
└── server/     Node.js + TypeScript + Express + PostgreSQL (pg)
```

## Database

Real Postgres schema in `server/src/db/schema.sql`:
customers, addresses, children, products, product_images, product_variants, carts, cart_items,
orders, order_items — matching the entity model from the original architecture doc.

Checkout runs inside a DB transaction: locks the variant rows, checks stock, inserts the order,
decrements inventory, and clears the cart — or rolls back entirely on any failure.

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
   npm run db:migrate   # creates tables
   npm run db:seed      # loads demo products/customer/orders
   npm run dev
   ```
3. Frontend (port 5173, proxies /api to :4000):
   ```
   cd client
   npm install
   npm run dev
   ```

Open http://localhost:5173

## Backend API

- `GET  /api/products?category=girls`
- `GET  /api/products/:slug`
- `GET  /api/search?q=dress`
- `GET  /api/cart/:cartId`
- `POST /api/cart/:cartId/items`          { productId, sku, qty }
- `PATCH /api/cart/:cartId/items/:sku`    { qty }
- `DELETE /api/cart/:cartId/items/:sku`
- `GET  /api/account`
- `GET  /api/orders/:id`
- `GET  /api/size-guide`
- `POST /api/size-recommendation`         { heightCm, ageYears }
- `POST /api/checkout`                    { cartId, items, subtotal, shipping, contact, address }
- `GET  /api/health`                      { ok, db: "connected" | server returns 503 if DB is down }

## Deploy on Railway

This repo has **three pieces** to provision — a Postgres database and two services:

1. **Add a PostgreSQL plugin** to your Railway project (New → Database → PostgreSQL). Railway
   provisions it and exposes a `DATABASE_URL`.
2. **Backend service** — Root Directory: `server`.
   - Add env var `DATABASE_URL` — reference the Postgres plugin's `DATABASE_URL` (Railway lets you
     link variables between services, or just copy the value).
   - Deploys via `railway.json` (`npm run build && npm start`).
   - After first deploy, run migration + seed once, either via Railway's shell/CLI in that service,
     or locally with `DATABASE_URL` pointed at the Railway Postgres:
     ```
     npm run db:migrate
     npm run db:seed
     ```
   - Note the generated public URL.
3. **Frontend service** — Root Directory: `client`.
   - Set env var `VITE_API_URL` to the backend's public URL (from step 2, no trailing slash).
   - Deploys via `railway.json`. Redeploy after setting the env var — Vite bakes it in at build time.

## Notes

- Cart is tracked via a client-generated ID stored in localStorage — no login required yet.
- Seed data includes SKUs with 0 inventory intentionally, to exercise out-of-stock handling.
- Images are Unsplash placeholders — swap for real product photography.
- Still not wired up: a CMS/admin panel, real payments, and customer login/auth. Ask for any of
  these next and they'll be built the same way — properly, one piece at a time.
