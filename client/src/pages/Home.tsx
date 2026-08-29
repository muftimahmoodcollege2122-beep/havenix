import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AtSign, Sparkles } from "lucide-react";
import TrustStrip from "../components/TrustStrip";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import Reveal from "../components/Reveal";
import IntroSplash from "../components/IntroSplash";
import Magnetic from "../components/Magnetic";
import { api } from "../lib/api";
import type { Product } from "../types";

const CATEGORIES = [
  { name: "Women", to: "/collections/women" },
  { name: "Men", to: "/collections/men" },
  { name: "Kids", to: "/collections/kids" },
  { name: "Accessories", to: "/collections/accessories" },
];

const INSTA_COUNT = 7;

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);

  useEffect(() => {
    api.getProducts().then((data) => setNewArrivals((data as Product[]).slice(0, 5)));
  }, []);

  return (
    <div className="overflow-x-hidden">
      <IntroSplash onReveal={() => setHeroRevealed(true)} />

      {/* Hero */}
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
                  to="/collections/women"
                  className="group relative overflow-hidden bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase transition-colors"
                >
                  <span className="relative z-10">Shop Collection</span>
                  <span className="absolute inset-0 bg-ink -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                </Link>
              </Magnetic>
              <Link
                to="/collections/women"
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
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent" />
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Shop by category */}
      <section className="max-w-[1440px] mx-auto px-6 py-16">
        <Reveal as="h2" className="text-center font-serif text-[13px] tracking-[0.3em] uppercase text-ink mb-10">
          Shop By Category
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.name} delay={i * 100}>
              <Link to={c.to} className="group block">
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
            to="/new-in"
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
                to="/collections/women"
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

      {/* Newsletter */}
      <section className="bg-paper border-t border-line">
        <div className="max-w-[1440px] mx-auto px-6 py-14 grid md:grid-cols-2 gap-8 items-center">
          <Reveal>
            <div className="font-serif text-[22px] text-ink mb-2">Be The First To Know</div>
            <p className="text-muted text-[14px] mb-5">Sign up for new arrivals, exclusive offers, and more.</p>
            {subscribed ? (
              <p className="text-clay text-sm" style={{ animation: "fadeUp 0.5s ease-out both" }}>
                Thanks for subscribing!
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSubscribed(true);
                }}
                className="flex gap-3 max-w-md"
              >
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="flex-1 bg-cream border border-line px-4 py-3 text-sm outline-none focus:border-clay transition-colors duration-300"
                />
                <Magnetic>
                  <button className="bg-espresso text-cream px-6 py-3 text-[12px] tracking-widest uppercase hover:bg-ink transition-colors duration-300 active:scale-95">
                    Subscribe
                  </button>
                </Magnetic>
              </form>
            )}
          </Reveal>
          <Reveal delay={150} className="grid grid-cols-3 gap-6 text-[12px] text-muted text-center md:text-left">
            <div>
              <div className="text-ink font-medium mb-1">Exclusive Offers</div>
              for subscribers
            </div>
            <div>
              <div className="text-ink font-medium mb-1">Early Access</div>
              to new collections
            </div>
            <div>
              <div className="text-ink font-medium mb-1">Special Treats</div>
              just for you
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
