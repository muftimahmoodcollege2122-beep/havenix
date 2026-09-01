import type { Metadata } from "next";

// Private/transactional page — must never be indexed. This lives in a
// layout because the page itself is a client component and can't export
// metadata directly.
// Every page here renders live, per-visitor data (cart contents, auth
// state, order details) — never statically prerender it. Without this,
// Next.js can optimize the route as static, which is vulnerable to the
// App Router bug where soft-navigating here from a dynamic route (e.g. a
// product page) renders stale cached content from the previous page
// instead of this one.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
