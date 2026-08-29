import Link from "next/link";
import type { Metadata } from "next";
import CollectionClient from "@/components/CollectionClient";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sale",
  description: "Havenix sale — quality apparel at reduced prices, while stocks last.",
};

export default async function SalePage() {
  const products = (await api.getProducts().catch(() => [])) as Product[];
  const onSale = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-[12px] text-muted mb-4">
        <Link href="/" className="hover:text-clay">Home</Link> / <span className="text-ink">Sale</span>
      </div>

      <h1 className="font-serif text-[26px] sm:text-[34px] text-ink mb-2">Sale</h1>
      <p className="text-muted text-[14px] mb-6 sm:mb-10">Quality apparel, reduced prices — while stocks last.</p>

      <CollectionClient category="sale" initialProducts={onSale} />
    </div>
  );
}
