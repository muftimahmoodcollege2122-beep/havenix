import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "@/components/ProductDetailClient";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

// Fetches live product/order data — never prerender at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = (await api.getProduct(slug).catch(() => null)) as Product | null;
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = (await api.getProduct(slug).catch(() => null)) as Product | null;
  if (!product) notFound();

  const categoryProducts = (await api.getProducts(product.category).catch(() => [])) as Product[];
  const related = categoryProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductDetailClient product={product} related={related} />;
}
