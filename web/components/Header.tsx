"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const NAV = [
  { label: "New In", to: "/new-in" },
  { label: "Women", to: "/collections/women" },
  { label: "Men", to: "/collections/men" },
  { label: "Kids", to: "/collections/kids" },
  { label: "Accessories", to: "/collections/accessories" },
  { label: "Collections", to: "/collections" },
  { label: "Sale", to: "/sale" },
];

export default function Header() {
  const { cart } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/98 border-b border-line">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6 flex-1">
          <button
            className="lg:hidden text-ink"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            className="text-ink hidden sm:block"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search size={19} />
          </button>
          <nav className="hidden lg:flex items-center gap-6 text-[13px] tracking-wide uppercase text-ink/80">
            {NAV.map((n) => (
              <Link key={n.label} href={n.to} className="link-underline hover:text-clay transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link href="/" className="flex-1 text-center">
          <div className="font-serif text-[20px] sm:text-[26px] md:text-[30px] tracking-[0.1em] sm:tracking-[0.15em] text-ink leading-none">
            HAVENIX
          </div>
          <div className="text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] text-clay mt-1">WOMEN · MEN · KIDS</div>
        </Link>

        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-5 text-ink">
          <Link href="/account" aria-label="Account" className="hidden sm:block hover:text-clay transition-colors">
            <User size={19} />
          </Link>
          <Link href="/account?tab=wishlist" aria-label="Wishlist" className="hidden sm:block hover:text-clay transition-colors">
            <Heart size={19} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative hover:text-clay transition-colors">
            <ShoppingBag size={19} />
            {cart.itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-clay text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line bg-paper">
          <form onSubmit={submitSearch} className="max-w-[1440px] mx-auto px-6 py-3 flex items-center gap-3">
            <Search size={16} className="text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
            />
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="lg:hidden border-t border-line bg-paper px-6 py-4 flex flex-col gap-3 text-sm uppercase tracking-wide">
          {NAV.map((n) => (
            <Link key={n.label} href={n.to} onClick={() => setMenuOpen(false)}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
