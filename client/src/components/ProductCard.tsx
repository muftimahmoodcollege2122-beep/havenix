import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductImage from "./ProductImage";
import type { Product } from "../types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group">
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden bg-paper aspect-[3/4]">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-cream/90 text-[10px] tracking-widest uppercase px-2 py-1 text-espresso">
            New
          </span>
        )}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cream/90 flex items-center justify-center text-ink hover:text-clay transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart size={15} />
        </button>
      </Link>
      <div className="mt-3">
        <Link to={`/products/${product.slug}`} className="text-[14px] font-medium text-ink hover:text-clay transition-colors">
          {product.name}
        </Link>
        <div className="text-[14px] font-medium text-ink/80 mt-0.5">PKR {product.price.toLocaleString()}</div>
        {product.isNew && <div className="text-[11px] tracking-wide text-clay mt-0.5">NEW</div>}
      </div>
    </div>
  );
}
