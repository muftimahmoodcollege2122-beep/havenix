import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Havenix — Timeless Apparel for Women, Men & Kids",
    template: "%s | Havenix",
  },
  description:
    "Havenix is a premium apparel brand for women, men, and kids. Thoughtfully designed, quality fabrics, made to last.",
};

// This is the true root layout. It intentionally has no header, footer, or
// cart/auth providers — those belong to the public storefront only and live
// in app/(site)/layout.tsx. Admin routes (app/admin/**) render inside this
// shell directly, with their own separate chrome (see admin/products/layout.tsx),
// so the storefront nav/cart/footer never leaks into the admin dashboard.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream font-body">{children}</body>
    </html>
  );
}
