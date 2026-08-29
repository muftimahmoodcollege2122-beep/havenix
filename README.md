# Havenix — Children's Fashion E-commerce

Full-stack build: React + TypeScript (Vite) frontend, Node.js + TypeScript (Express) backend.
Matches the 10-page Havenix mockups: Homepage, Collection (Girls/Boys/Baby), Product, Cart,
Checkout, Search, Account Dashboard, Size Guide/Child Profile, Order Tracking, Footer.

## Structure

```
havenix/
├── client/     React + TypeScript + Tailwind (Vite)
└── server/     Node.js + TypeScript + Express (mock/in-memory data)
```

## Run locally

Terminal 1 — backend (port 4000):
```
cd server
npm install
npm run dev
```

Terminal 2 — frontend (port 5173, proxies /api to :4000):
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
- `POST /api/checkout`                    { items, subtotal, shipping, contact, address }

Data is in-memory (server/src/data/*) — resets on server restart. Swap in PostgreSQL later
following the schema in the original architecture doc (products, product_variants, carts,
orders, etc.) without changing the route contracts.

## Deploy on Railway

This repo has **two services** — deploy each as a separate Railway service pointed at this repo,
with different **Root Directory** settings:

1. **Backend** — Root Directory: `server`. Railway auto-builds and runs via `railway.json`
   (`npm run build && npm start`). No env vars required. Note the generated public URL.
2. **Frontend** — Root Directory: `client`. Set env var `VITE_API_URL` to the backend's public URL
   (from step 1, no trailing slash). Railway builds and serves via `railway.json`.

Redeploy the frontend after setting `VITE_API_URL` so the build picks it up (Vite env vars are
baked in at build time).

## Notes

- Cart is tracked via a client-generated ID stored in localStorage — no login required.
- Inventory is deterministic mock data (some SKUs are intentionally out of stock).
- Images are Unsplash placeholders — swap for real product photography.
