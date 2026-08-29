import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Upload, X } from "lucide-react";
import { adminApi } from "./adminApi";
import type { AdminProductInput, AdminVariant } from "./adminApi";

const CATEGORIES = ["women", "men", "kids", "accessories"];

const SUBCATEGORIES = ["Dresses", "Tops", "Bottoms", "Sets", "Knitwear", "Outerwear", "Sleepwear"];

const MATERIALS = [
  "Cotton",
  "Linen",
  "Silk",
  "Wool",
  "Cashmere",
  "Denim",
  "Leather",
  "Polyester",
  "Viscose",
  "Cotton Blend",
  "Knit Blend",
];

const SIZE_RANGES = ["XS-XL", "XS-L", "S-XL", "2Y-7Y", "0-24M", "One Size"];

const ADULT_SIZES = ["XS", "S", "M", "L", "XL"];
const KIDS_SIZES = ["2Y", "3Y", "4Y", "5Y", "6Y", "7Y"];
const ACCESSORY_SIZES = ["One Size"];

const COLORS = [
  { name: "Blush", hex: "#EFD3CE" },
  { name: "Cream", hex: "#F3ECDD" },
  { name: "Rose", hex: "#D98E8A" },
  { name: "Sage", hex: "#B7BFA8" },
  { name: "Camel", hex: "#C69C6D" },
  { name: "Black", hex: "#2A211C" },
  { name: "White", hex: "#FBF7F2" },
  { name: "Navy", hex: "#2E3A4F" },
  { name: "Tan", hex: "#D8C6AE" },
];

const OTHER = "Other (custom)";

const MAX_IMAGES = 7;

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
  const [category, setCategory] = useState("women");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [care, setCare] = useState("");
  const [sizeRange, setSizeRange] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [variants, setVariants] = useState<AdminVariant[]>([emptyVariant()]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [subCategoryCustom, setSubCategoryCustom] = useState(false);
  const [materialCustom, setMaterialCustom] = useState(false);

  const variantSizeOptions =
    category === "kids" ? KIDS_SIZES : category === "accessories" ? ACCESSORY_SIZES : ADULT_SIZES;

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
      setSubCategoryCustom(!SUBCATEGORIES.includes(p.subCategory));
      setPrice(String(p.price));
      setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : "");
      setIsNew(p.isNew);
      setDescription(p.description || "");
      setMaterial(p.material || "");
      setMaterialCustom(Boolean(p.material) && !MATERIALS.includes(p.material));
      setCare(p.care || "");
      setSizeRange(p.sizeRange || "");
      setImages(p.images || []);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file later
    if (files.length === 0) return;

    setUploadError("");
    const remaining = MAX_IMAGES - images.filter((i) => i.trim()).length;
    if (remaining <= 0) {
      setUploadError(`You can only add up to ${MAX_IMAGES} images.`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setUploadError(`Only ${remaining} more image(s) allowed — uploaded the first ${remaining}.`);
    }

    setUploading(true);
    try {
      for (const file of toUpload) {
        const url = await adminApi.uploadImage(file);
        setImages((prev) => [...prev, url]);
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
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
      sizeRange,
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
    <div className="p-4 sm:p-8 max-w-[820px]">
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
            <Field label="Sub-category">
              {subCategoryCustom ? (
                <div className="flex gap-2">
                  <input
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    placeholder="Custom sub-category"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSubCategoryCustom(false);
                      setSubCategory(SUBCATEGORIES[0]);
                    }}
                    className="text-[11px] text-clay hover:text-espresso whitespace-nowrap"
                  >
                    Use list
                  </button>
                </div>
              ) : (
                <select
                  value={subCategory}
                  onChange={(e) => {
                    if (e.target.value === OTHER) {
                      setSubCategoryCustom(true);
                      setSubCategory("");
                    } else {
                      setSubCategory(e.target.value);
                    }
                  }}
                  className="input"
                >
                  <option value="" disabled>
                    Select sub-category
                  </option>
                  {SUBCATEGORIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value={OTHER}>{OTHER}</option>
                </select>
              )}
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
            <Field label="Size Range">
              <select value={sizeRange} onChange={(e) => setSizeRange(e.target.value)} className="input">
                <option value="" disabled>
                  Select size range
                </option>
                {SIZE_RANGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
              {materialCustom ? (
                <div className="flex gap-2">
                  <input
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Custom material"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMaterialCustom(false);
                      setMaterial(MATERIALS[0]);
                    }}
                    className="text-[11px] text-clay hover:text-espresso whitespace-nowrap"
                  >
                    Use list
                  </button>
                </div>
              ) : (
                <select
                  value={material}
                  onChange={(e) => {
                    if (e.target.value === OTHER) {
                      setMaterialCustom(true);
                      setMaterial("");
                    } else {
                      setMaterial(e.target.value);
                    }
                  }}
                  className="input"
                >
                  <option value="" disabled>
                    Select material
                  </option>
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value={OTHER}>{OTHER}</option>
                </select>
              )}
            </Field>
            <Field label="Care Instructions">
              <input value={care} onChange={(e) => setCare(e.target.value)} className="input" />
            </Field>
          </div>
        </section>

        {/* Images */}
        <section className="bg-cream border border-line rounded-sm p-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[13px] tracking-widest uppercase text-ink">
              Images ({images.filter((i) => i.trim()).length}/{MAX_IMAGES})
            </h2>
            {uploadError && <span className="text-[12px] text-rose">{uploadError}</span>}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images
              .filter((i) => i.trim())
              .map((img, i) => (
                <div key={img + i} className="relative aspect-square border border-line rounded-sm overflow-hidden group">
                  <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((x) => x !== img))}
                    className="absolute top-1 right-1 bg-ink/70 text-cream rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}

            {images.filter((i) => i.trim()).length < MAX_IMAGES && (
              <label
                className={`aspect-square border border-dashed border-line rounded-sm flex flex-col items-center justify-center gap-1.5 text-muted cursor-pointer hover:border-clay hover:text-clay transition-colors ${
                  uploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {uploading ? (
                  <span className="text-[11px]">Uploading...</span>
                ) : (
                  <>
                    <Upload size={18} />
                    <span className="text-[11px] text-center px-1">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileSelect}
                />
              </label>
            )}
          </div>

          <p className="text-[11px] text-muted">Up to {MAX_IMAGES} images, 8MB max each.</p>

          <details className="text-[12px]">
            <summary className="text-clay cursor-pointer select-none">Or add image by URL</summary>
            <div className="flex gap-2 mt-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  if (urlInput.trim() && images.filter((i) => i.trim()).length < MAX_IMAGES) {
                    setImages((prev) => [...prev.filter((i) => i.trim()), urlInput.trim()]);
                    setUrlInput("");
                  }
                }}
                className="text-clay hover:text-espresso transition-colors px-3 border border-line"
              >
                Add
              </button>
            </div>
          </details>
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
          {variants.map((v, i) => {
            const colorIsCustom = v.color !== "" && !COLORS.some((c) => c.name === v.color);
            const sizeIsCustom = v.size !== "" && !variantSizeOptions.includes(v.size);
            return (
              <div key={i} className="overflow-x-auto">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_0.8fr_auto] gap-2 items-center min-w-[560px]">
                  <input
                    value={v.sku}
                    onChange={(e) => updateVariant(i, { sku: e.target.value })}
                    placeholder="SKU"
                    className="input"
                  />
                  <select
                    value={colorIsCustom ? OTHER : v.color}
                    onChange={(e) => {
                      if (e.target.value === OTHER) {
                        updateVariant(i, { color: " " }); // marks custom mode; trimmed before submit
                      } else {
                        const preset = COLORS.find((c) => c.name === e.target.value);
                        updateVariant(i, { color: e.target.value, colorHex: preset?.hex || v.colorHex });
                      }
                    }}
                    className="input"
                  >
                    <option value="" disabled>
                      Color
                    </option>
                    {COLORS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value={OTHER}>{OTHER}</option>
                  </select>
                  <input
                    type="color"
                    value={v.colorHex}
                    onChange={(e) => updateVariant(i, { colorHex: e.target.value })}
                    className="h-[42px] w-full border border-line rounded-sm"
                  />
                  <select
                    value={sizeIsCustom ? OTHER : v.size}
                    onChange={(e) =>
                      updateVariant(i, { size: e.target.value === OTHER ? " " : e.target.value })
                    }
                    className="input"
                  >
                    <option value="" disabled>
                      Size
                    </option>
                    {variantSizeOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value={OTHER}>{OTHER}</option>
                  </select>
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
                {(colorIsCustom || sizeIsCustom) && (
                  <div className="flex gap-2 mt-2 min-w-[560px]">
                    {colorIsCustom && (
                      <input
                        value={v.color.trim()}
                        onChange={(e) => updateVariant(i, { color: e.target.value })}
                        placeholder="Custom color name"
                        className="input flex-1"
                        autoFocus
                      />
                    )}
                    {sizeIsCustom && (
                      <input
                        value={v.size.trim()}
                        onChange={(e) => updateVariant(i, { size: e.target.value })}
                        placeholder="Custom size"
                        className="input flex-1"
                        autoFocus
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
