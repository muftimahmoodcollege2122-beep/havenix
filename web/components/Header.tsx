"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Tag,
  LayoutGrid,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "New In", to: "/new-in" },
  { label: "Women", to: "/collections/women" },
  { label: "Men", to: "/collections/men" },
  { label: "Kids", to: "/collections/kids" },
  { label: "Accessories", to: "/collections/accessories" },
  { label: "Collections", to: "/collections" },
  { label: "Sale", to: "/sale" },
];

interface DeptGroup {
  label: string;
  to: string;
  subcats: string[];
}

const DEPARTMENTS: DeptGroup[] = [
  {
    label: "Women",
    to: "/collections/women",
    subcats: ["Dresses", "Tops", "Bottoms", "Sets", "Knitwear", "Outerwear", "Eastern Wear", "Western Wear", "Sleepwear"],
  },
  {
    label: "Men",
    to: "/collections/men",
    subcats: ["Shirts", "T-Shirts", "Bottoms", "Sets", "Knitwear", "Outerwear", "Eastern Wear", "Western Wear"],
  },
  {
    label: "Kids",
    to: "/collections/kids",
    subcats: ["Tops", "Bottoms", "Sets", "Rompers", "Sleepwear"],
  },
  {
    label: "Accessories",
    to: "/collections/accessories",
    subcats: ["Bags", "Belts", "Jewelry", "Scarves", "Hats"],
  },
];

export default function Header() {
  const { cart } = useCart();
  const { customer } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setExpanded(null);
  };

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
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
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
          <Link href={customer ? "/account" : "/login"} aria-label="Account" className="hidden sm:block hover:text-clay transition-colors">
            <User size={19} />
          </Link>
          <Link href="/account?tab=wishlist" aria-label="Wishlist" className="hidden sm:block hover:text-clay transition-colors">
            <Heart size={19} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative hover:text-clay transition-colors">
            <ShoppingBag size={19} />
            <AnimatePresence>
              {cart.itemCount > 0 && (
                <motion.span
                  key={cart.itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -top-2 -right-2 bg-clay text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {cart.itemCount}
                </motion.span>
              )}
            </AnimatePresence>
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

      {/* Mobile menu: backdrop + slide-in side drawer */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-50 bg-ink/35 transition-opacity duration-300 ease-out ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`lg:hidden fixed top-0 left-0 h-full w-[86%] max-w-[380px] z-50 bg-cream/92 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <div>
            <div className="font-serif text-[18px] tracking-[0.15em] text-ink">HAVENIX</div>
            <div className="text-[9px] tracking-[0.3em] text-clay mt-0.5">WOMEN · MEN · KIDS</div>
          </div>
          <button onClick={closeMenu} aria-label="Close menu" className="text-ink p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <MenuLink to="/new-in" icon={<Sparkles size={16} />} label="New In" onClick={closeMenu} />

          {DEPARTMENTS.map((dept) => {
            const isOpen = expanded === dept.label;
            return (
              <div key={dept.label} className="border-b border-line/70 last:border-0">
                <div className="flex items-center">
                  <Link
                    href={dept.to}
                    onClick={closeMenu}
                    className="flex-1 py-3.5 px-3 text-[14px] tracking-wide text-ink"
                  >
                    {dept.label}
                  </Link>
                  <button
                    onClick={() => setExpanded(isOpen ? null : dept.label)}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${dept.label}`}
                    className="p-3 text-muted hover:text-clay transition-colors"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="pb-3 pl-6 pr-3 flex flex-col gap-0.5">
                      {dept.subcats.map((s) => (
                        <Link
                          key={s}
                          href={`${dept.to}?sub=${encodeURIComponent(s)}`}
                          onClick={closeMenu}
                          className="py-2 text-[13px] text-muted hover:text-clay transition-colors"
                        >
                          {s}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <MenuLink to="/collections" icon={<LayoutGrid size={16} />} label="All Collections" onClick={closeMenu} />
          <MenuLink to="/sale" icon={<Tag size={16} />} label="Sale" onClick={closeMenu} />

          <div className="h-px bg-line my-3" />

          <MenuLink to={customer ? "/account" : "/login"} icon={<User size={16} />} label={customer ? "My Account" : "Login / Sign Up"} onClick={closeMenu} />
          <MenuLink to="/account?tab=wishlist" icon={<Heart size={16} />} label="Wishlist" onClick={closeMenu} />
          <MenuLink to="/size-guide" icon={<LayoutGrid size={16} />} label="Size Guide" onClick={closeMenu} />
          <MenuLink to="/help" icon={<HelpCircle size={16} />} label="Help Center" onClick={closeMenu} />
          <MenuLink to="/contact" icon={<MessageCircle size={16} />} label="Contact Us" onClick={closeMenu} />
        </nav>
      </div>
    </header>
  );
}

function MenuLink({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={to}
      onClick={onClick}
      className="flex items-center gap-3 py-3.5 px-3 text-[14px] tracking-wide text-ink border-b border-line/70 last:border-0 hover:text-clay transition-colors"
    >
      <span className="text-clay">{icon}</span>
      {label}
    </Link>
  );
}
