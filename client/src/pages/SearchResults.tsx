import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { api } from "../lib/api";
import type { Product } from "../types";

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.search(q).then((data) => {
      setResults(data as Product[]);
      setLoading(false);
    });
  }, [q]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-[20px] tracking-wide text-ink mb-1">Search Results</h1>
      <p className="text-muted text-[14px] mb-8">"{q}" · {results.length} results found</p>

      {loading ? (
        <div className="text-muted text-sm py-20 text-center">Searching...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted mb-2">Can't find what you're looking for?</p>
          <p className="text-muted text-sm mb-6">We're here to help.</p>
          <button className="border border-ink px-7 py-3 text-[12px] tracking-widest uppercase hover:bg-ink hover:text-cream transition-colors">
            Chat With Us
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-8">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
