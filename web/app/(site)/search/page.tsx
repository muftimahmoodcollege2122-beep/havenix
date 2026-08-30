import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    // Search results pages are thin, infinitely-variable content that
    // shouldn't compete with real category/product pages in the index.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? ((await api.search(q).catch(() => [])) as Product[]) : [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-[20px] tracking-wide text-ink mb-1">Search Results</h1>
      <p className="text-muted text-[14px] mb-8">&quot;{q}&quot; · {results.length} results found</p>

      {results.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted mb-2">Can&apos;t find what you&apos;re looking for?</p>
          <p className="text-muted text-sm mb-6">We&apos;re here to help.</p>
          <button className="border border-ink px-7 py-3 text-[12px] tracking-widest uppercase hover:bg-ink hover:text-cream transition-colors">
            Chat With Us
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-8">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
