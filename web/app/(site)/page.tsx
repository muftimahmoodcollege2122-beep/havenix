import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, AtSign } from "lucide-react";
import TrustStrip from "@/components/TrustStrip";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import HeroSection from "@/components/HeroSection";
import Newsletter from "@/components/Newsletter";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

// Fetches live product/order data — never prerender at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Havenix — Timeless Apparel for Women, Men & Kids" },
  description:
    "Shop premium, thoughtfully designed apparel for the whole family. Quality fabrics, timeless style, made to last. New arrivals weekly.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Havenix — Timeless Apparel for Women, Men & Kids",
    description:
      "Shop premium, thoughtfully designed apparel for the whole family. Quality fabrics, timeless style, made to last.",
    url: "/",
    type: "website",
  },
};

const CATEGORIES = [
  { name: "Women", to: "/collections/women" },
  { name: "Men", to: "/collections/men" },
  { name: "Kids", to: "/collections/kids" },
  { name: "Accessories", to: "/collections/accessories" },
];

const INSTA_COUNT = 7;

export default async function Home() {
  const allProducts = (await api.getProducts().catch(() => [])) as Product[];
  const newArrivals = allProducts.slice(0, 5);

  return (
    <div className="overflow-x-hidden">
      <HeroSection />

      <TrustStrip />

      {/* Shop by category */}
      <section className="max-w-[1440px] mx-auto px-6 py-16">
        <Reveal as="h2" className="text-center font-serif text-[13px] tracking-[0.3em] uppercase text-ink mb-10">
          Shop By Category
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.name} delay={i * 100}>
              <Link href={c.to} className="group block">
                <div className="aspect-[4/5] overflow-hidden">
                  <ProductImage
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
                <div className="bg-blush/40 text-center py-4 transition-colors duration-300 group-hover:bg-blush/70">
                  <div className="text-[13px] tracking-widest uppercase text-ink">{c.name}</div>
                  <div className="text-[12px] text-clay mt-1 flex items-center justify-center gap-1">
                    Shop Now
                    <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1440px] mx-auto px-6 py-10">
        <Reveal className="flex items-center justify-between mb-8">
          <h2 className="text-[15px] tracking-widest uppercase text-ink">New Arrivals</h2>
          <Link
            href="/new-in"
            className="link-underline group text-[12px] tracking-widest uppercase text-clay flex items-center gap-1 hover:text-espresso transition-colors"
          >
            View All New In
            <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          {newArrivals.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="max-w-[1440px] mx-auto px-6 py-10">
        <Reveal className="grid md:grid-cols-2 bg-blush/30 rounded-sm overflow-hidden group">
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <h3 className="font-serif text-[30px] md:text-[36px] leading-tight text-ink mb-5">
              Quality fabrics.<br />Beautifully made.<br />For every wardrobe.
            </h3>
            <Magnetic>
              <Link
                href="/collections/women"
                className="relative overflow-hidden bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase w-fit transition-colors hover:bg-ink"
              >
                Discover More
              </Link>
            </Magnetic>
          </div>
          <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
            <ProductImage
              alt="Quality fabrics"
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
          </div>
        </Reveal>
      </section>

      {/* Instagram strip */}
      <section className="max-w-[1440px] mx-auto px-6 py-16 overflow-hidden">
        <Reveal className="text-center mb-8">
          <h2 className="font-serif text-[20px] tracking-wide text-ink">Follow Along</h2>
          <div className="text-[13px] text-clay mt-1">@havenix</div>
        </Reveal>
        <div className="hidden md:grid grid-cols-7 gap-3">
          {Array.from({ length: INSTA_COUNT }).map((_, i) => (
            <Reveal key={i} delay={i * 60} className="aspect-square overflow-hidden">
              <ProductImage
                alt=""
                className="w-full h-full object-cover transition-[opacity,transform] duration-500 hover:opacity-80 hover:scale-105"
              />
            </Reveal>
          ))}
          <Reveal delay={INSTA_COUNT * 60} className="aspect-square">
            <div
              className="w-full h-full bg-espresso text-cream flex flex-col items-center justify-center gap-2 text-center px-2 transition-colors duration-300 hover:bg-ink"
              style={{ animation: "pulseRing 2.5s ease-out infinite" }}
            >
              <AtSign size={20} />
              <span className="text-[10px] tracking-widest uppercase">Follow Us on Instagram</span>
            </div>
          </Reveal>
        </div>
        {/* mobile: infinite marquee */}
        <div className="md:hidden -mx-6">
          <div className="marquee-track gap-3 px-6">
            {Array.from({ length: INSTA_COUNT * 2 }).map((_, i) => (
              <div key={i} className="w-28 h-28 shrink-0 overflow-hidden">
                <ProductImage alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
