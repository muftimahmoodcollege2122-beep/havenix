import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "@/components/ProductDetailClient";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

// Fetches live product/order data — never prerender at build time.
export const dynamic = "force-dynamic";

interface ProductResponse {
  product: Product;
  related: Product[];
}

async function fetchProduct(slug: string): Promise<ProductResponse | null> {
  try {
    return (await api.getProduct(slug)) as ProductResponse;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    // A real failure (API unreachable, 500, timeout) — don't lie and say
    // "not found"; let it surface to the route's error boundary instead.
    throw err;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchProduct(slug).catch(() => null);
  if (!data?.product) return { title: "Product Not Found" };
  const { product } = data;
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      url: `/products/${product.slug}`,
      type: "website",
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

function inStock(product: Product) {
  return product.variants.some((v) => v.inventory > 0);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await fetchProduct(slug);
  if (!data?.product) notFound();
  const { product, related } = data;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://havenix.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.variants[0]?.sku,
    material: product.material,
    category: `${product.category} / ${product.subCategory}`,
    brand: { "@type": "Brand", name: "Havenix" },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price,
      availability: inStock(product)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.hasRealReviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
