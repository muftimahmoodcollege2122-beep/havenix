const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;
const STORAGE_KEY = "havenix_admin_key";

export function getAdminKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setAdminKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key);
}

export function clearAdminKey() {
  localStorage.removeItem(STORAGE_KEY);
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": getAdminKey() || "",
    },
    ...options,
  });
  if (res.status === 401) {
    clearAdminKey();
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export interface AdminVariant {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  inventory: number;
}

export interface AdminProductInput {
  name: string;
  category: string;
  subCategory: string;
  price: number;
  compareAtPrice?: number | null;
  isNew?: boolean;
  description?: string;
  material?: string;
  care?: string;
  ageRange?: string;
  images: string[];
  variants: AdminVariant[];
}

export const adminApi = {
  login: async (key: string): Promise<boolean> => {
    const res = await fetch(`${BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    return res.ok;
  },
  listProducts: () => req<any[]>(`/admin/products`),
  createProduct: (input: AdminProductInput) =>
    req(`/admin/products`, { method: "POST", body: JSON.stringify(input) }),
  updateProduct: (id: string, input: AdminProductInput) =>
    req(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteProduct: (id: string) => req(`/admin/products/${id}`, { method: "DELETE" }),
  updateInventory: (sku: string, inventory: number) =>
    req(`/admin/variants/${sku}/inventory`, { method: "PATCH", body: JSON.stringify({ inventory }) }),
};
