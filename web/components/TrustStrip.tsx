"use client";

import { motion } from "framer-motion";
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
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.title}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              className="text-clay"
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.5 }}
            >
              {it.icon}
            </motion.span>
            <div>
              <div className="text-[13px] text-ink font-medium">{it.title}</div>
              <div className="text-[12px] text-muted">{it.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
