"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

const SUBCATS = [
  "Dresses",
  "Tops",
  "Shirts",
  "T-Shirts",
  "Bottoms",
  "Sets",
  "Knitwear",
  "Outerwear",
  "Sleepwear",
  "Eastern Wear",
  "Western Wear",
  "Rompers",
];
const ADULT_SIZES = ["XS", "S", "M", "L", "XL"];
const KIDS_SIZES = ["2Y", "3Y", "4Y", "5Y", "6Y", "7Y"];
const COLORS = [
  { name: "Blush", hex: "#EFD3CE" },
  { name: "Cream", hex: "#F3ECDD" },
  { name: "Rose", hex: "#D98E8A" },
  { name: "Sage", hex: "#B7BFA8" },
  { name: "Camel", hex: "#C69C6D" },
];

export default function CollectionClient({
  category,
  initialProducts,
  initialSubFilter = null,
}: {
  category: string;
  initialProducts: Product[];
  initialSubFilter?: string | null;
}) {
  const sizeOptions = category === "kids" ? KIDS_SIZES : ADULT_SIZES;
  const [products] = useState<Product[]>(initialProducts);
  const [sort, setSort] = useState("newest");
  const [subFilter, setSubFilter] = useState<string | null>(initialSubFilter);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (subFilter) list = list.filter((p) => p.subCategory === subFilter);
    if (colorFilter) list = list.filter((p) => p.variants.some((v) => v.color === colorFilter));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, subFilter, colorFilter, sort]);

  const availableSubcats = useMemo(() => {
    const present = SUBCATS.filter((s) => products.some((p) => p.subCategory === s));
    if (subFilter && !present.includes(subFilter)) present.push(subFilter);
    return present;
  }, [products, subFilter]);

  return (
    <>
      <button
        onClick={() => setFiltersOpen((v) => !v)}
        className="md:hidden flex items-center gap-2 border border-line px-4 py-2.5 text-[12px] tracking-widest uppercase text-ink mb-5"
      >
        {filtersOpen ? <X size={14} /> : <SlidersHorizontal size={14} />}
        {filtersOpen ? "Close Filters" : "Filters"}
      </button>

      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.aside
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="md:hidden overflow-hidden"
          >
            <div className="space-y-8 pb-6">
              <FilterGroup title="Category">
                <div className="space-y-2 text-[13px]">
                  {availableSubcats.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer text-ink/80 hover:text-ink">
                      <input
                        type="checkbox"
                        checked={subFilter === s}
                        onChange={() => setSubFilter(subFilter === s ? null : s)}
                        className="accent-clay"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </FilterGroup>
              <FilterGroup title="Size">
                <div className="space-y-2 text-[13px]">
                  {sizeOptions.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer text-ink/80 hover:text-ink">
                      <input type="checkbox" className="accent-clay" />
                      {s}
                    </label>
                  ))}
                </div>
              </FilterGroup>
              <FilterGroup title="Color">
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColorFilter(colorFilter === c.name ? null : c.name)}
                      title={c.name}
                      className={`w-7 h-7 rounded-full border-2 ${colorFilter === c.name ? "border-clay" : "border-transparent"}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </FilterGroup>
              <FilterGroup title="Price">
                <input type="range" min={0} max={20000} className="w-full accent-clay" />
              </FilterGroup>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        {/* Filters sidebar (desktop) */}
        <aside className="space-y-8 hidden md:block">
          <FilterGroup title="Category">
            <div className="space-y-2 text-[13px]">
              {availableSubcats.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer text-ink/80 hover:text-ink">
                  <input
                    type="checkbox"
                    checked={subFilter === s}
                    onChange={() => setSubFilter(subFilter === s ? null : s)}
                    className="accent-clay"
                  />
                  {s}
                </label>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Size">
            <div className="space-y-2 text-[13px]">
              {sizeOptions.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer text-ink/80 hover:text-ink">
                  <input type="checkbox" className="accent-clay" />
                  {s}
                </label>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Color">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColorFilter(colorFilter === c.name ? null : c.name)}
                  title={c.name}
                  className={`w-7 h-7 rounded-full border-2 ${colorFilter === c.name ? "border-clay" : "border-transparent"}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Price">
            <input type="range" min={0} max={20000} className="w-full accent-clay" />
          </FilterGroup>
        </aside>

        {/* Product grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-[13px] text-muted">{filtered.length} products</div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-transparent border border-line px-4 py-2 pr-8 text-[13px] outline-none"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted text-sm py-20 text-center"
            >
              No products found.
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-8"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {filtered.length > 0 && (
            <div className="text-center mt-12">
              <button className="border border-ink px-8 py-3 text-[12px] tracking-widest uppercase hover:bg-ink hover:text-cream transition-colors">
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12px] tracking-widest uppercase text-ink mb-3">{title}</div>
      {children}
    </div>
  );
}
