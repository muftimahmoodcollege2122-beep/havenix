import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

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
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-cream font-body">{children}</body>
    </html>
  );
}
