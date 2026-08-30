# Havenix — Storefront (Next.js)

This is the SEO-focused, server-rendered replacement for the Vite SPA in `../client`. It
serves the public storefront (home, collections, product pages, cart, checkout, account,
search, size guide) against the existing Express API in `../server`.

## Why this exists

The Vite SPA renders empty on first load and has no per-page metadata, which hurts SEO,
link previews, and first paint. This app fixes that with:

- Server-rendered product/category/search pages (real HTML, not a JS-only shell)
- Per-page metadata and OpenGraph tags (product name/description/image)
- `next/font` self-hosted fonts (Cormorant Garamond, Manrope) — no layout shift
- `sitemap.xml` / `robots.txt` generated from live product data
- Client-side interactivity (cart, filters, checkout, variant picker) kept exactly where it's needed, nowhere else

## Running locally

```bash
cp .env.example .env.local   # point at your running Express API
npm install
npm run dev
```

Requires the Express API (`../server`) running and reachable at the URLs in `.env.local`:

- `API_URL` — used by the Next.js server for SSR fetches (can be an internal/docker hostname)
- `NEXT_PUBLIC_API_URL` — used by the browser for client-side fetches (cart, checkout, account)
- `NEXT_PUBLIC_SITE_URL` — used for sitemap/robots/canonical URLs

**Important deployment note:** the Express server's own `CLIENT_URL` env var must point at
*this* app's URL (not the old Vite app), since `payments.ts` builds the post-payment
redirect (`${CLIENT_URL}/payments/return?orderId=...`) from it. If `CLIENT_URL` still points
at the Vite app after cutover, payment redirects will land on the wrong frontend.

## Structure

- `app/` — routes (App Router). Server components fetch data; interactive pieces are
  extracted into small `"use client"` components (e.g. `ProductDetailClient`, `CollectionClient`).
- `components/` — shared UI, ported from `../client/src/components`
- `context/CartContext.tsx` — cart state, SSR-safe (guards `localStorage` access)
- `lib/api.ts` — API client; picks the right base URL for server vs. browser calls
- `lib/types.ts` — shared types, ported from `../client/src/types`

## What's intentionally not migrated yet

The admin panel (`../client/src/admin`) stays on the Vite app for now — it's a logged-in
tool with no SEO surface, so there's no benefit to migrating it, and it can move later
without affecting the storefront.

`/payments/mock-gateway` (the dev-only simulated payment gateway, used when
`PAYMENT_PROVIDER=mock`) renders inside the normal site layout here, so it shows the
Havenix header/footer above the simulated gateway card. In the Vite app it was a
standalone full-screen route with no chrome. This is cosmetic only — the payment flow
itself works identically — but if pixel-parity matters, it can be moved into a route
group with its own root layout later.

## Status

All 13 storefront routes plus customer auth (login/signup) and full payment checkout
(JazzCash, EasyPaisa, card, bank transfer, COD, mock gateway for dev) are ported and pass
`next build`. Once this is verified against a live database, it can replace `../client` as
the primary storefront; `../client` can then be trimmed down to just the admin panel or
retired entirely.
