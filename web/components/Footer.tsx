import Link from "next/link";
import { ShieldCheck, RefreshCw, Award, Globe, AtSign, Share2, MapPin, Music2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/90 mt-24">
      <div className="max-w-[1440px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif text-[22px] tracking-[0.15em]">HAVENIX</div>
          <div className="text-[10px] tracking-[0.35em] text-clay mt-1 mb-4">WOMEN · MEN · KIDS</div>
          <p className="text-xs text-cream/60 leading-relaxed">
            Timeless apparel for the whole family. Crafted with love. Designed to last.
          </p>
          <div className="flex gap-3 mt-5 text-cream/70">
            <AtSign size={16} />
            <Share2 size={16} />
            <MapPin size={16} />
            <Music2 size={16} />
          </div>
        </div>

        <FooterCol title="Shop" links={[
          { label: "New In", to: "/new-in" },
          { label: "Women", to: "/collections/women" },
          { label: "Men", to: "/collections/men" },
          { label: "Kids", to: "/collections/kids" },
          { label: "Sale", to: "/sale" },
        ]} />
        <FooterCol title="Customer Care" links={[
          { label: "Shipping & Delivery", to: "/shipping-returns" },
          { label: "Returns & Exchanges", to: "/shipping-returns" },
          { label: "Size Guide", to: "/size-guide" },
          { label: "FAQ", to: "/help" },
        ]} />
        <FooterCol title="About" links={[
          { label: "Our Story", to: "/about" },
          { label: "Contact Us", to: "/contact" },
        ]} />
        <FooterCol title="Info" links={[
          { label: "Collections", to: "/collections" },
          { label: "Privacy Policy", to: "/privacy" },
          { label: "Terms & Conditions", to: "/terms" },
        ]} />
      </div>

      <div className="border-t border-cream/10">
        <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-cream/70">
          <Badge icon={<ShieldCheck size={16} />} title="Secure Payment" sub="100% Protected" />
          <Badge icon={<RefreshCw size={16} />} title="Easy Returns" sub="15 Days Return" />
          <Badge icon={<Award size={16} />} title="Quality Assured" sub="Premium Fabrics" />
          <Badge icon={<Globe size={16} />} title="Worldwide Shipping" sub="Fast & Reliable" />
        </div>
      </div>

      <div className="border-t border-cream/10 text-center text-[11px] text-cream/50 py-5">
        © 2026 Havenix. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <div className="text-[11px] tracking-widest uppercase text-cream/50 mb-4">{title}</div>
      <ul className="space-y-2.5 text-[13px] text-cream/80">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.to} className="hover:text-clay transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-clay">{icon}</span>
      <div>
        <div className="text-cream font-medium">{title}</div>
        <div className="text-cream/50">{sub}</div>
      </div>
    </div>
  );
}
