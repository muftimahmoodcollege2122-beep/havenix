import type { Metadata } from "next";

// Transactional payment flow pages — never index these.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
