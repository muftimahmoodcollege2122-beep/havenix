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

## Status

All 13 storefront routes are ported and pass `next build`. Once this is verified against
a live database, it can replace `../client` as the primary storefront; `../client` can then
be trimmed down to just the admin panel or retired entirely.
