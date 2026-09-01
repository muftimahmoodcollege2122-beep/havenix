"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ChevronDown, ShieldCheck, RefreshCw, Award, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import ProductReviews from "@/components/ProductReviews";
import Reveal from "@/components/Reveal";
import type { Product } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const router = useRouter();
  const { addItem, loading } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const firstVariant = product.variants[0];
  const [color, setColor] = useState<string | null>(firstVariant?.color || null);
  const [size, setSize] = useState<string | null>(firstVariant?.size || null);
  const [openSection, setOpenSection] = useState<string | null>("description");
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [error, setError] = useState("");

  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizesForColor = product.variants.filter((v) => v.color === color);
  const selectedVariant = product.variants.find((v) => v.color === color && v.size === size);
  const outOfStock = selectedVariant ? selectedVariant.inventory <= 0 : false;

  const handleAddToBag = async () => {
    if (!selectedVariant) return;
    setError("");
    try {
      await addItem(product.id, selectedVariant.sku, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not add to bag");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-[12px] text-muted mb-6">
        <Link href="/" className="hover:text-clay">Home</Link> /{" "}
        <Link href={`/collections/${product.category}`} className="hover:text-clay capitalize">{product.category}</Link> /{" "}
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {product.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="relative w-16 h-20 shrink-0 overflow-hidden border border-line"
                >
                  <ProductImage src={img} alt={`${product.name} — view ${i + 1}`} className="w-full h-full object-cover" />
                  {activeImage === i && (
                    <motion.div
                      layoutId="thumb-active"
                      className="absolute inset-0 border-2 border-clay"
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 relative">
            {product.isNew && (
              <span className="absolute top-4 left-4 z-10 bg-cream text-[10px] tracking-widest uppercase px-2 py-1">
                New Arrival
              </span>
            )}
            <div className="relative aspect-[3/4] overflow-hidden bg-paper">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeImage}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <ProductImage
                    src={product.images[activeImage]}
                    alt={product.name}
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Info */}
        <Reveal>
          <h1 className="font-serif text-[26px] sm:text-[30px] text-ink mb-2">{product.name}</h1>
          <div className="text-[20px] font-medium text-ink mb-3">PKR {product.price.toLocaleString()}</div>
          {product.hasRealReviews && (
            <div className="flex items-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(product.rating) ? "fill-clay text-clay" : "text-line"} />
              ))}
              <span className="text-[13px] text-muted">({product.reviewCount} Review{product.reviewCount === 1 ? "" : "s"})</span>
            </div>
          )}

          <div className="mb-6">
            <div className="text-[12px] tracking-widest uppercase text-ink mb-3">
              Color: <span className="text-muted normal-case">{color}</span>
            </div>
            <div className="flex gap-3">
              {colors.map((c) => {
                const v = product.variants.find((vv) => vv.color === c);
                return (
                  <motion.button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      const firstSize = product.variants.find((vv) => vv.color === c);
                      setSize(firstSize?.size || null);
                    }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: color === c ? 1.15 : 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-clay" : "border-line"}`}
                    style={{ backgroundColor: v?.colorHex }}
                    title={c}
                  />
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[12px] tracking-widest uppercase text-ink">Size: {size}</div>
              <Link href="/size-guide" className="text-[12px] text-clay underline underline-offset-2">Size Guide</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((v) => (
                <motion.button
                  key={v.sku}
                  disabled={v.inventory <= 0}
                  onClick={() => setSize(v.size)}
                  whileTap={v.inventory > 0 ? { scale: 0.92 } : undefined}
                  className={`w-11 h-11 border text-[13px] flex items-center justify-center transition-colors duration-200 ${
                    size === v.size ? "border-espresso bg-espresso text-cream" : "border-line text-ink"
                  } ${v.inventory <= 0 ? "opacity-30 line-through cursor-not-allowed" : "hover:border-espresso"}`}
                >
                  {v.size}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-rose text-sm mb-3 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          {outOfStock && <div className="text-clay text-sm mb-3">This size is currently out of stock.</div>}

          <div className="flex gap-3 mb-8">
            <motion.button
              onClick={handleAddToBag}
              disabled={loading || outOfStock || !selectedVariant}
              whileTap={{ scale: 0.98 }}
              className="relative flex-1 bg-espresso text-cream py-4 text-[13px] tracking-widest uppercase disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                <AnimatePresence mode="popLayout">
                  {added && (
                    <motion.span
                      initial={{ scale: 0, width: 0 }}
                      animate={{ scale: 1, width: "auto" }}
                      exit={{ scale: 0, width: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                    >
                      <Check size={15} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {added ? "Added to Bag" : outOfStock ? "Out of Stock" : "Add to Bag"}
              </span>
            </motion.button>
            <motion.button
              onClick={() => setWishlisted((w) => !w)}
              whileTap={{ scale: 0.85 }}
              className="w-14 border border-line flex items-center justify-center hover:border-clay transition-colors"
            >
              <motion.span animate={wishlisted ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
                <Heart size={18} className={wishlisted ? "fill-clay text-clay" : ""} />
              </motion.span>
            </motion.button>
          </div>
          <AnimatePresence>
            {added && (
              <motion.button
                initial={{ opacity: 0, height: 0, marginTop: -32, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: -24, marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginTop: -32, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                onClick={() => router.push("/cart")}
                className="text-[12px] text-clay underline underline-offset-2 block overflow-hidden"
              >
                View Bag
              </motion.button>
            )}
          </AnimatePresence>

          <div className="divide-y divide-line border-t border-b border-line">
            <Accordion
              title="Description"
              open={openSection === "description"}
              onClick={() => setOpenSection(openSection === "description" ? null : "description")}
            >
              {product.description}
            </Accordion>
            <Accordion
              title="Material & Care"
              open={openSection === "material"}
              onClick={() => setOpenSection(openSection === "material" ? null : "material")}
            >
              {product.material}. {product.care}.
            </Accordion>
            <Accordion
              title="Shipping & Returns"
              open={openSection === "shipping"}
              onClick={() => setOpenSection(openSection === "shipping" ? null : "shipping")}
            >
              Free shipping on orders over PKR 10,000. Easy 15-day returns on unworn items with tags attached.
            </Accordion>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 text-center text-[11px] text-muted">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck size={18} className="text-clay" /> Secure Payment
            </div>
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={18} className="text-clay" /> Easy Returns 15 Days
            </div>
            <div className="flex flex-col items-center gap-2">
              <Award size={18} className="text-clay" /> Quality Assured Premium Fabrics
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-16 pt-12 border-t border-line max-w-2xl">
        <h2 className="text-[15px] tracking-widest uppercase text-ink mb-8">Customer Reviews</h2>
        <ProductReviews slug={product.slug} />
      </Reveal>

      {related.length > 0 && (
        <div className="mt-20">
          <Reveal as="h2" className="text-[15px] tracking-widest uppercase text-ink mb-8">
            You May Also Like
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Accordion({
  title,
  children,
  open,
  onClick,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div>
      <button onClick={onClick} className="w-full flex items-center justify-between py-4 text-[13px] text-ink">
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }}>
          <ChevronDown size={15} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="text-[13px] text-muted leading-relaxed pb-4">{children}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
