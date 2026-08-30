import type { Metadata } from "next";

// Private/transactional page — must never be indexed. This lives in a
// layout because the page itself is a client component and can't export
// metadata directly.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
