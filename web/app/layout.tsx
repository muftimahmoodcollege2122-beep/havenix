import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://havenix.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Havenix — Timeless Apparel for Women, Men & Kids",
    template: "%s | Havenix",
  },
  description:
    "Havenix is a premium apparel brand for women, men, and kids. Thoughtfully designed, quality fabrics, made to last.",
  openGraph: {
    siteName: "Havenix",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// This is the true root layout. It intentionally has no header, footer, or
// cart/auth providers — those belong to the public storefront only and live
// in app/(site)/layout.tsx. Admin routes (app/admin/**) render inside this
// shell directly, with their own separate chrome (see admin/products/layout.tsx),
// so the storefront nav/cart/footer never leaks into the admin dashboard.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Havenix",
        url: siteUrl,
        logo: `${siteUrl}/favicon.ico`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Havenix",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-cream font-body">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
