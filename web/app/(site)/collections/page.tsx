import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import ProductImage from "@/components/ProductImage";

const DEPARTMENTS = [
  { name: "Women", to: "/collections/women", blurb: "Dresses, knitwear & more" },
  { name: "Men", to: "/collections/men", blurb: "Shirts, sets & essentials" },
  { name: "Kids", to: "/collections/kids", blurb: "Soft, durable, playful" },
  { name: "Accessories", to: "/collections/accessories", blurb: "Finishing touches" },
];

export const metadata = {
  title: "Collections",
  description: "Shop Havenix by department: Women, Men, Kids, and Accessories.",
};

export default function CollectionsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-[12px] text-muted mb-4">
        <Link href="/" className="hover:text-clay">Home</Link> / <span className="text-ink">Collections</span>
      </div>

      <h1 className="font-serif text-[26px] sm:text-[34px] text-ink mb-2">Shop by Department</h1>
      <p className="text-muted text-[14px] mb-8 sm:mb-10">Timeless apparel for the whole family.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {DEPARTMENTS.map((d, i) => (
          <Reveal key={d.name} delay={i * 100}>
            <Link href={d.to} className="group block">
              <div className="aspect-[4/5] overflow-hidden relative">
                <ProductImage
                  alt={d.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>
              <div className="bg-blush/40 text-center py-4 transition-colors duration-300 group-hover:bg-blush/70">
                <div className="text-[13px] tracking-widest uppercase text-ink font-medium">{d.name}</div>
                <div className="text-[11px] text-muted mt-1">{d.blurb}</div>
                <div className="text-[12px] text-clay mt-2 flex items-center justify-center gap-1">
                  Shop Now
                  <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
