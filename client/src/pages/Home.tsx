import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AtSign } from "lucide-react";
import TrustStrip from "../components/TrustStrip";
import ProductCard from "../components/ProductCard";
import { api } from "../lib/api";
import type { Product } from "../types";

const CATEGORIES = [
  { name: "Girls", to: "/collections/girls", img: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600" },
  { name: "Boys", to: "/collections/boys", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600" },
  { name: "Baby", to: "/collections/baby", img: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600" },
  { name: "Accessories", to: "/collections/accessories", img: "https://images.unsplash.com/photo-1519457851430-31b60c9e5484?w=600" },
];

const INSTA = [
  "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300",
  "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300",
  "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300",
  "https://images.unsplash.com/photo-1519457851430-31b60c9e5484?w=300",
  "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=300",
  "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300",
];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    api.getProducts().then((data) => setNewArrivals((data as Product[]).slice(0, 5)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 items-center gap-8 px-6 pt-10 pb-10">
          <div>
            <div className="text-[12px] tracking-widest uppercase text-clay mb-4">New Collection 2026</div>
            <h1 className="font-serif text-[42px] md:text-[54px] leading-[1.1] text-ink mb-5">
              Timeless style<br />for little hearts.
            </h1>
            <p className="text-muted text-[15px] leading-relaxed max-w-md mb-8">
              Thoughtfully designed outfits for every adventure, made with love and soft on their world.
            </p>
            <div className="flex items-center gap-5">
              <Link
                to="/collections/girls"
                className="bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors"
              >
                Shop New In
              </Link>
              <Link to="/collections/girls" className="text-[13px] tracking-widest uppercase text-ink flex items-center gap-2 hover:text-clay transition-colors">
                Explore Collections <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <img
              src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1000"
              alt="Havenix kids"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Shop by category */}
      <section className="max-w-[1440px] mx-auto px-6 py-16">
        <h2 className="text-center font-serif text-[13px] tracking-[0.3em] uppercase text-ink mb-10">
          Shop By Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={c.to} className="group block">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="bg-blush/40 text-center py-4">
                <div className="text-[13px] tracking-widest uppercase text-ink">{c.name}</div>
                <div className="text-[12px] text-clay mt-1 flex items-center justify-center gap-1">
                  Shop Now <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[15px] tracking-widest uppercase text-ink">New Arrivals</h2>
          <Link to="/new-in" className="text-[12px] tracking-widest uppercase text-clay flex items-center gap-1 hover:text-espresso transition-colors">
            View All New In <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 bg-blush/30 rounded-sm overflow-hidden">
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <h3 className="font-serif text-[30px] md:text-[36px] leading-tight text-ink mb-5">
              Soft fabrics.<br />Beautifully made.<br />For every little moment.
            </h3>
            <Link
              to="/collections/girls"
              className="bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase w-fit hover:bg-ink transition-colors"
            >
              Discover More
            </Link>
          </div>
          <div className="aspect-[4/3] md:aspect-auto">
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900"
              alt="Soft fabrics"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Instagram strip */}
      <section className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="font-serif text-[20px] tracking-wide text-ink">Little Moments, Big Memories</h2>
          <div className="text-[13px] text-clay mt-1">@havenix.children</div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {INSTA.map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
            </div>
          ))}
          <div className="hidden md:flex aspect-square bg-espresso text-cream flex-col items-center justify-center gap-2 text-center px-2">
            <AtSign size={20} />
            <span className="text-[10px] tracking-widest uppercase">Follow Us on Instagram</span>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-paper border-t border-line">
        <div className="max-w-[1440px] mx-auto px-6 py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="font-serif text-[22px] text-ink mb-2">Be The First To Know</div>
            <p className="text-muted text-[14px] mb-5">Sign up for new arrivals, exclusive offers, and more.</p>
            {subscribed ? (
              <p className="text-clay text-sm">Thanks for subscribing!</p>
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
                  className="flex-1 bg-cream border border-line px-4 py-3 text-sm outline-none focus:border-clay"
                />
                <button className="bg-espresso text-cream px-6 py-3 text-[12px] tracking-widest uppercase hover:bg-ink transition-colors">
                  Subscribe
                </button>
              </form>
            )}
          </div>
          <div className="grid grid-cols-3 gap-6 text-[12px] text-muted text-center md:text-left">
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
          </div>
        </div>
      </section>
    </div>
  );
}
