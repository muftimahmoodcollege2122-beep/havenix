import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://havenix.com";
  const products = (await api.getProducts().catch(() => [])) as Product[];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/collections/women`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/collections/men`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/collections/kids`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/collections/accessories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/new-in`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/sale`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/size-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
