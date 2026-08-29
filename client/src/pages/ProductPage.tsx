import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Star, ChevronDown, ShieldCheck, RefreshCw, Award } from "lucide-react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { addItem, loading } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>("description");
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAdded(false);
    setError("");
    api.getProduct(slug).then((data: any) => {
      setProduct(data.product);
      setRelated(data.related);
      const firstVariant = data.product.variants[0];
      setColor(firstVariant?.color || null);
      setSize(firstVariant?.size || null);
      setActiveImage(0);
    });
  }, [slug]);

  if (!product) return <div className="max-w-[1440px] mx-auto px-6 py-20 text-center text-muted">Loading...</div>;

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
    } catch (e: any) {
      setError(e.message || "Could not add to bag");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-[12px] text-muted mb-6">
        <Link to="/" className="hover:text-clay">Home</Link> /{" "}
        <Link to={`/collections/${product.category}`} className="hover:text-clay capitalize">{product.category}</Link> /{" "}
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-20 shrink-0 overflow-hidden border ${activeImage === i ? "border-clay" : "border-line"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            {product.isNew && (
              <span className="absolute top-4 left-4 z-10 bg-cream text-[10px] tracking-widest uppercase px-2 py-1">
                New Arrival
              </span>
            )}
            <div className="aspect-[3/4] overflow-hidden bg-paper">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="font-serif text-[26px] sm:text-[30px] text-ink mb-2">{product.name}</h1>
          <div className="text-[20px] text-ink mb-3">PKR {product.price.toLocaleString()}</div>
          <div className="flex items-center gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(product.rating) ? "fill-clay text-clay" : "text-line"} />
            ))}
            <span className="text-[13px] text-muted">({product.reviewCount} Reviews)</span>
          </div>

          <div className="mb-6">
            <div className="text-[12px] tracking-widest uppercase text-ink mb-3">
              Color: <span className="text-muted normal-case">{color}</span>
            </div>
            <div className="flex gap-3">
              {colors.map((c) => {
                const v = product.variants.find((vv) => vv.color === c);
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      const firstSize = product.variants.find((vv) => vv.color === c);
                      setSize(firstSize?.size || null);
                    }}
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
              <button className="text-[12px] text-clay underline underline-offset-2">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((v) => (
                <button
                  key={v.sku}
                  disabled={v.inventory <= 0}
                  onClick={() => setSize(v.size)}
                  className={`w-11 h-11 border text-[13px] flex items-center justify-center transition-colors ${
                    size === v.size ? "border-espresso bg-espresso text-cream" : "border-line text-ink"
                  } ${v.inventory <= 0 ? "opacity-30 line-through cursor-not-allowed" : "hover:border-espresso"}`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="text-rose text-sm mb-3">{error}</div>}
          {outOfStock && <div className="text-clay text-sm mb-3">This size is currently out of stock.</div>}

          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToBag}
              disabled={loading || outOfStock || !selectedVariant}
              className="flex-1 bg-espresso text-cream py-4 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
            >
              {added ? "Added to Bag ✓" : outOfStock ? "Out of Stock" : "Add to Bag"}
            </button>
            <button className="w-14 border border-line flex items-center justify-center hover:border-clay transition-colors">
              <Heart size={18} />
            </button>
          </div>
          {added && (
            <button onClick={() => navigate("/cart")} className="text-[12px] text-clay underline underline-offset-2 -mt-6 mb-8 block">
              View Bag
            </button>
          )}

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
            <Accordion
              title={`Reviews (${product.reviewCount})`}
              open={openSection === "reviews"}
              onClick={() => setOpenSection(openSection === "reviews" ? null : "reviews")}
            >
              Loved by parents for the soft fabric and thoughtful fit. Reviews load here.
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
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-[15px] tracking-widest uppercase text-ink mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
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
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-[13px] text-muted leading-relaxed pb-4">{children}</p>}
    </div>
  );
}
