import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://havenix.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/checkout", "/cart", "/admin", "/login", "/signup", "/payments", "/search", "/orders"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
