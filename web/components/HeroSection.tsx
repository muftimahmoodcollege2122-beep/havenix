"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import IntroSplash from "@/components/IntroSplash";
import Magnetic from "@/components/Magnetic";

export default function HeroSection() {
  const [heroRevealed, setHeroRevealed] = useState(false);

  return (
    <>
      <IntroSplash onReveal={() => setHeroRevealed(true)} />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 right-[6%] w-24 h-24 rounded-full bg-blush/50 float-shape hidden md:block" />
        <div
          className="pointer-events-none absolute top-1/3 left-[3%] w-12 h-12 rounded-full bg-clay/30 float-shape hidden md:block"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 items-center gap-8 px-6 pt-10 pb-10">
          <div>
            <div
              className={`${heroRevealed ? "hero-title-anim" : "pre-reveal"} text-[12px] tracking-widest uppercase text-clay mb-4 flex items-center gap-2`}
              style={{ animationDelay: "0.05s" }}
            >
              <Sparkles size={13} className="text-clay" />
              New Collection 2026
            </div>
            <h1 className="font-serif text-[42px] md:text-[54px] leading-[1.1] text-ink mb-5">
              <span
                className={`${heroRevealed ? "hero-title-anim" : "pre-reveal"} inline-block`}
                style={{ animationDelay: "0.15s" }}
              >
                Timeless style
              </span>
              <br />
              <span
                className={`${heroRevealed ? "hero-title-anim" : "pre-reveal"} inline-block`}
                style={{ animationDelay: "0.3s" }}
              >
                for every wardrobe.
              </span>
            </h1>
            <p
              className={`${heroRevealed ? "hero-title-anim" : "pre-reveal"} text-muted text-[15px] leading-relaxed max-w-md mb-8`}
              style={{ animationDelay: "0.45s" }}
            >
              Thoughtfully designed apparel for women, men, and kids — made with love and built to last.
            </p>
            <div
              className={`${heroRevealed ? "hero-title-anim" : "pre-reveal"} flex items-center gap-5`}
              style={{ animationDelay: "0.6s" }}
            >
              <Magnetic>
                <Link
                  href="/collections/women"
                  className="group relative overflow-hidden bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase transition-colors"
                >
                  <span className="relative z-10">Shop Collection</span>
                  <span className="absolute inset-0 bg-ink -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                </Link>
              </Magnetic>
              <Link
                href="/collections/women"
                className="link-underline group text-[13px] tracking-widest uppercase text-ink flex items-center gap-2 hover:text-clay transition-colors"
              >
                Explore Collections
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>
          <div
            className={`relative aspect-[4/3] overflow-hidden rounded-sm group ${heroRevealed ? "" : "pre-reveal"}`}
            style={heroRevealed ? { animation: "fadeIn 1.1s ease-out both" } : undefined}
          >
            <ProductImage
              alt="Havenix"
              priority
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent" />
          </div>
        </div>
      </section>
    </>
  );
}
