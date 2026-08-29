import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { adminApi } from "./adminApi";

interface AdminVariant {
  sku: string;
  color: string;
  size: string;
  inventory: number;
}

interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  images: string[];
  variants: AdminVariant[];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [savingSku, setSavingSku] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listProducts()
      .then((data) => setProducts(data as AdminProduct[]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await adminApi.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateStock = async (sku: string, value: number, productId: string) => {
    if (value < 0 || Number.isNaN(value)) return;
    setSavingSku(sku);
    try {
      await adminApi.updateInventory(sku, value);
      setProducts((prev) =>
        prev.map((p) =>
          p.id !== productId
            ? p
            : { ...p, variants: p.variants.map((v) => (v.sku === sku ? { ...v, inventory: value } : v)) }
        )
      );
    } finally {
      setSavingSku(null);
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const totalStock = (p: AdminProduct) => p.variants.reduce((sum, v) => sum + v.inventory, 0);

  return (
    <div className="p-4 sm:p-8 max-w-[1200px]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-[22px] sm:text-[24px] text-ink">Products & Stock</h1>
          <p className="text-muted text-[13px] mt-1">{products.length} products listed</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-espresso text-cream px-4 sm:px-5 py-2.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors"
        >
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-cream border border-line pl-9 pr-4 py-2.5 text-sm outline-none focus:border-clay transition-colors"
        />
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading products...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-sm">No products found.</p>
      ) : (
        <div className="bg-cream border border-line rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] tracking-widest uppercase text-muted">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock (by variant)</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-blush/30 overflow-hidden shrink-0">
                        {p.images[0] && (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="text-ink font-medium">{p.name}</div>
                        <div className="text-muted text-[12px]">{p.subCategory}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted capitalize">{p.category}</td>
                  <td className="px-5 py-4 text-ink">PKR {p.price.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      {p.variants.map((v) => (
                        <div key={v.sku} className="flex items-center gap-2 text-[12px]">
                          <span className="text-muted w-20 truncate">
                            {v.color} / {v.size}
                          </span>
                          <input
                            type="number"
                            min={0}
                            defaultValue={v.inventory}
                            onBlur={(e) => updateStock(v.sku, Number(e.target.value), p.id)}
                            disabled={savingSku === v.sku}
                            className={`w-16 border px-2 py-1 text-center outline-none transition-colors ${
                              v.inventory === 0
                                ? "border-rose/60 text-rose"
                                : "border-line focus:border-clay"
                            }`}
                          />
                        </div>
                      ))}
                      <div className="text-[11px] text-clay mt-0.5">Total: {totalStock(p)}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="text-muted hover:text-espresso transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => remove(p.id, p.name)}
                        className="text-muted hover:text-rose transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
