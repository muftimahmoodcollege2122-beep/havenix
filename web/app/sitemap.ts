import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://havenix.com";
  const products = (await api.getProducts().catch(() => [])) as Product[];

  const staticRoutes = [
    "",
    "/collections",
    "/collections/women",
    "/collections/men",
    "/collections/kids",
    "/collections/accessories",
    "/new-in",
    "/sale",
    "/size-guide",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes];
}
