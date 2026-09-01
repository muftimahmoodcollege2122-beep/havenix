// Every admin page is a client component that renders live, per-request
// data (products, stock, auth state) — none of it should ever be statically
// prerendered. Without this, Next.js optimizes these routes as static, which
// makes them vulnerable to the App Router client-side navigation bug where a
// route reached via soft navigation from a dynamic page (e.g. a storefront
// product page) can render stale cached content instead of the real page.
// See the same fix applied to app/(site)/cart, checkout, login, etc.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
