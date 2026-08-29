import { Leaf, Package, Lock, Headphones } from "lucide-react";

const ITEMS = [
  { icon: <Leaf size={20} />, title: "Premium Quality", sub: "Made with love & care" },
  { icon: <Package size={20} />, title: "Easy Returns", sub: "Hassle free returns" },
  { icon: <Lock size={20} />, title: "Secure Payments", sub: "100% secure checkout" },
  { icon: <Headphones size={20} />, title: "Caring Support", sub: "We're here to help" },
];

export default function TrustStrip() {
  return (
    <div className="border-y border-line bg-cream">
      <div className="max-w-[1440px] mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">
        {ITEMS.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <span className="text-clay">{it.icon}</span>
            <div>
              <div className="text-[13px] text-ink font-medium">{it.title}</div>
              <div className="text-[12px] text-muted">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
