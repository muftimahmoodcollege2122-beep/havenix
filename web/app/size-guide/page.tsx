import type { Metadata } from "next";
import SizeGuideClient from "@/components/SizeGuideClient";
import { api } from "@/lib/api";

// Fetches live product/order data — never prerender at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Find your perfect Havenix fit with our women's, men's, and kids' size charts.",
};

export default async function SizeGuidePage() {
  const guides = (await api.getSizeGuide().catch(() => ({ women: [], men: [], kids: [] }))) as Record<
    "women" | "men" | "kids",
    { size: string; label: string; heightCm: string; chestCm: string; waistCm: string }[]
  >;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-[20px] tracking-wide text-ink mb-8">Size Guide</h1>
      <SizeGuideClient guides={guides} />
    </div>
  );
}
