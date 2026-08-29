import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { api } from "../lib/api";
import type { Product } from "../types";

const SUBCATS = ["Dresses", "Tops", "Bottoms", "Sets", "Knitwear", "Outerwear", "Sleepwear"];
const AGES = ["0-3M", "3-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y"];
const COLORS = [
  { name: "Blush", hex: "#EFD3CE" },
  { name: "Cream", hex: "#F3ECDD" },
  { name: "Rose", hex: "#D98E8A" },
  { name: "Sage", hex: "#B7BFA8" },
  { name: "Camel", hex: "#C69C6D" },
];

export default function Collection() {
  const { category = "girls" } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState("newest");
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getProducts(category).then((data) => {
      setProducts(data as Product[]);
      setLoading(false);
    });
    setSubFilter(null);
    setColorFilter(null);
  }, [category]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (subFilter) list = list.filter((p) => p.subCategory === subFilter);
    if (colorFilter) list = list.filter((p) => p.variants.some((v) => v.color === colorFilter));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, subFilter, colorFilter, sort]);

  const availableSubcats = useMemo(
    () => SUBCATS.filter((s) => products.some((p) => p.subCategory === s)),
    [products]
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="text-[12px] text-muted mb-4">
        <Link to="/" className="hover:text-clay">Home</Link> / <span className="text-ink capitalize">{category}</span>
      </div>

      <h1 className="font-serif text-[34px] text-ink capitalize mb-2">{category}</h1>
      <p className="text-muted text-[14px] mb-10">Thoughtfully designed for every chapter of childhood.</p>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        {/* Filters sidebar */}
        <aside className="space-y-8">
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

          <FilterGroup title="Age">
            <div className="space-y-2 text-[13px]">
              {AGES.map((a) => (
                <label key={a} className="flex items-center gap-2 cursor-pointer text-ink/80 hover:text-ink">
                  <input type="checkbox" className="accent-clay" />
                  {a}
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

          {loading ? (
            <div className="text-muted text-sm py-20 text-center">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-muted text-sm py-20 text-center">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
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
    </div>
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
