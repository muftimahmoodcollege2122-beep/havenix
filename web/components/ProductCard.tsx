"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const secondImage = product.images[1];

  return (
    <motion.div
      className="group"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden bg-paper aspect-[3/4] rounded-[2px]">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductImage src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        </motion.div>

        <AnimatePresence>
          {hovered && secondImage && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: 1.06 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductImage src={secondImage} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/25 to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35 }}
        />

        {product.isNew && (
          <span className="absolute top-3 left-3 bg-cream/90 text-[10px] tracking-widest uppercase px-2 py-1 text-espresso">
            New
          </span>
        )}

        <motion.button
          onClick={(e) => {
            e.preventDefault();
            setWishlisted((w) => !w);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cream/90 flex items-center justify-center text-ink"
          aria-label="Add to wishlist"
          whileTap={{ scale: 0.85 }}
        >
          <motion.span
            animate={wishlisted ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Heart size={15} className={wishlisted ? "fill-clay text-clay" : "text-ink"} />
          </motion.span>
        </motion.button>

        <motion.div
          className="absolute inset-x-0 bottom-0 flex justify-center pb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="bg-cream/95 text-espresso text-[11px] tracking-widest uppercase px-4 py-2">
            View Product
          </span>
        </motion.div>
      </Link>

      <div className="mt-3">
        <Link href={`/products/${product.slug}`} className="text-[14px] font-medium text-ink hover:text-clay transition-colors">
          {product.name}
        </Link>
        <div className="text-[14px] font-medium text-ink/80 mt-0.5">PKR {product.price.toLocaleString()}</div>
        {product.isNew && <div className="text-[11px] tracking-wide text-clay mt-0.5">NEW</div>}
      </div>
    </motion.div>
  );
}
