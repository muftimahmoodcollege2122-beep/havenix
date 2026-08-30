import Link from "next/link";
import type { Metadata } from "next";
import CollectionClient from "@/components/CollectionClient";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

// Fetches live product/order data — never prerender at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  const description = `Shop Havenix ${label} — thoughtfully designed apparel, made to last.`;
  return {
    title: label,
    description,
    alternates: { canonical: `/collections/${category}` },
    openGraph: {
      title: label,
      description,
      url: `/collections/${category}`,
      type: "website",
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const products = (await api.getProducts(category).catch(() => [])) as Product[];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://havenix.com";
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        item: `${siteUrl}/collections/${category}`,
      },
    ],
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="text-[12px] text-muted mb-4">
        <Link href="/" className="hover:text-clay">Home</Link> / <span className="text-ink capitalize">{category}</span>
      </div>

      <h1 className="font-serif text-[26px] sm:text-[34px] text-ink capitalize mb-2">{category}</h1>
      <p className="text-muted text-[14px] mb-6 sm:mb-10">Thoughtfully designed apparel, made to last.</p>

      <CollectionClient category={category} initialProducts={products} />
    </div>
  );
}
