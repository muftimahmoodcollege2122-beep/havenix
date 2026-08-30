import Link from "next/link";
import type { Metadata } from "next";
import CollectionClient from "@/components/CollectionClient";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

// Fetches live product/order data — never prerender at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New In",
  description: "The latest arrivals at Havenix — new season styles for women, men, and kids.",
};

export default async function NewInPage() {
  const products = (await api.getProducts().catch(() => [])) as Product[];
  const newest = products.filter((p) => p.isNew);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-[12px] text-muted mb-4">
        <Link href="/" className="hover:text-clay">Home</Link> / <span className="text-ink">New In</span>
      </div>

      <h1 className="font-serif text-[26px] sm:text-[34px] text-ink mb-2">New In</h1>
      <p className="text-muted text-[14px] mb-6 sm:mb-10">The latest arrivals, fresh off the rail.</p>

      <CollectionClient category="new-in" initialProducts={newest.length > 0 ? newest : products} />
    </div>
  );
}
