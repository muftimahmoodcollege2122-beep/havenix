import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { adminApi } from "./adminApi";
import type { AdminProductInput, AdminVariant } from "./adminApi";

const CATEGORIES = ["girls", "boys", "baby", "accessories"];

const emptyVariant = (): AdminVariant => ({
  sku: "",
  color: "",
  colorHex: "#000000",
  size: "",
  inventory: 0,
});

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("girls");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [care, setCare] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [variants, setVariants] = useState<AdminVariant[]>([emptyVariant()]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    adminApi.listProducts().then((all: any[]) => {
      const p = all.find((x) => x.id === id);
      if (!p) {
        setError("Product not found.");
        setLoading(false);
        return;
      }
      setName(p.name);
      setCategory(p.category);
      setSubCategory(p.subCategory);
      setPrice(String(p.price));
      setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : "");
      setIsNew(p.isNew);
      setDescription(p.description || "");
      setMaterial(p.material || "");
      setCare(p.care || "");
      setAgeRange(p.ageRange || "");
      setImages(p.images.length ? p.images : [""]);
      setVariants(
        p.variants.length
          ? p.variants.map((v: any) => ({
              sku: v.sku,
              color: v.color,
              colorHex: v.colorHex,
              size: v.size,
              inventory: v.inventory,
            }))
          : [emptyVariant()]
      );
      setLoading(false);
    });
  }, [id, isEdit]);

  const updateVariant = (i: number, patch: Partial<AdminVariant>) => {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  };

  const updateImage = (i: number, url: string) => {
    setImages((prev) => prev.map((img, idx) => (idx === i ? url : img)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !subCategory.trim() || !price) {
      setError("Name, sub-category, and price are required.");
      return;
    }
    const cleanVariants = variants.filter((v) => v.sku.trim() && v.color.trim() && v.size.trim());
    if (cleanVariants.length === 0) {
      setError("Add at least one complete variant (SKU, color, size).");
      return;
    }

    const input: AdminProductInput = {
      name: name.trim(),
      category,
      subCategory: subCategory.trim(),
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      isNew,
      description,
      material,
      care,
      ageRange,
      images: images.filter((i) => i.trim()),
      variants: cleanVariants,
    };

    setSaving(true);
    try {
      if (isEdit && id) {
        await adminApi.updateProduct(id, input);
      } else {
        await adminApi.createProduct(input);
      }
      navigate("/admin/products");
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-[820px]">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-espresso transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Back to Products
      </Link>
      <h1 className="font-serif text-[24px] text-ink mb-6">{isEdit ? "Edit Product" : "Add Product"}</h1>

      <form onSubmit={submit} className="space-y-8">
        {error && (
          <p className="bg-rose/10 border border-rose/40 text-rose text-[13px] px-4 py-3 rounded-sm">
            {error}
          </p>
        )}

        {/* Basic info */}
        <section className="bg-cream border border-line rounded-sm p-6 space-y-4">
          <h2 className="text-[13px] tracking-widest uppercase text-ink mb-2">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Product Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </Field>
            <Field label="Sub-category (e.g. Dresses)">
              <input value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="input" />
            </Field>
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input capitalize">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Age Range (e.g. 2-6Y)">
              <input value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="input" />
            </Field>
            <Field label="Price (PKR)">
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Compare-at Price (optional)">
              <input
                type="number"
                min={0}
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
            Mark as New Arrival
          </label>
        </section>

        {/* Details */}
        <section className="bg-cream border border-line rounded-sm p-6 space-y-4">
          <h2 className="text-[13px] tracking-widest uppercase text-ink mb-2">Details</h2>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input h-24" />
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Material">
              <input value={material} onChange={(e) => setMaterial(e.target.value)} className="input" />
            </Field>
            <Field label="Care Instructions">
              <input value={care} onChange={(e) => setCare(e.target.value)} className="input" />
            </Field>
          </div>
        </section>

        {/* Images */}
        <section className="bg-cream border border-line rounded-sm p-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[13px] tracking-widest uppercase text-ink">Images (URLs)</h2>
            <button
              type="button"
              onClick={() => setImages((prev) => [...prev, ""])}
              className="text-clay text-[12px] flex items-center gap-1 hover:text-espresso transition-colors"
            >
              <Plus size={13} /> Add Image
            </button>
          </div>
          {images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={img}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder="https://..."
                className="input flex-1"
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-muted hover:text-rose transition-colors px-2"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Variants */}
        <section className="bg-cream border border-line rounded-sm p-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[13px] tracking-widest uppercase text-ink">Variants & Stock</h2>
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
              className="text-clay text-[12px] flex items-center gap-1 hover:text-espresso transition-colors"
            >
              <Plus size={13} /> Add Variant
            </button>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_0.8fr_auto] gap-2 items-center">
              <input
                value={v.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
                placeholder="SKU"
                className="input"
              />
              <input
                value={v.color}
                onChange={(e) => updateVariant(i, { color: e.target.value })}
                placeholder="Color"
                className="input"
              />
              <input
                type="color"
                value={v.colorHex}
                onChange={(e) => updateVariant(i, { colorHex: e.target.value })}
                className="h-[42px] w-full border border-line rounded-sm"
              />
              <input
                value={v.size}
                onChange={(e) => updateVariant(i, { size: e.target.value })}
                placeholder="Size"
                className="input"
              />
              <input
                type="number"
                min={0}
                value={v.inventory}
                onChange={(e) => updateVariant(i, { inventory: Number(e.target.value) })}
                placeholder="Stock"
                className="input"
              />
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-muted hover:text-rose transition-colors px-2"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </section>

        <div className="flex items-center gap-4">
          <button
            disabled={saving}
            className="bg-espresso text-cream px-7 py-3 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
          <Link to="/admin/products" className="text-[13px] text-muted hover:text-ink transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-widest uppercase text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}
