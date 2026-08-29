function normalizeApiOrigin(raw: string): string {
  const trimmed = raw.replace(/\/+$/, "");
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const API_ORIGIN = normalizeApiOrigin(import.meta.env.VITE_API_URL || "");
const BASE = `${API_ORIGIN}/api`;
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

async function parseJsonOrDiagnose(res: Response, url: string): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const looksLikeHtml = text.trim().startsWith("<");
    if (looksLikeHtml) {
      throw new Error(
        `Got a webpage instead of API data from: ${url}\n` +
          `This means VITE_API_URL isn't pointing at the backend correctly. ` +
          `Configured API base: "${API_ORIGIN || "(empty — not set)"}". ` +
          `Check the frontend service's VITE_API_URL variable on Railway and redeploy.`
      );
    }
    throw new Error(`Unexpected response from ${url}: ${text.slice(0, 200)}`);
  }
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
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
  const data = await parseJsonOrDiagnose(res, url);
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
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
  sizeRange?: string;
  images: string[];
  variants: AdminVariant[];
}

export const adminApi = {
  login: async (key: string): Promise<boolean> => {
    const url = `${BASE}/admin/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) return false;
    try {
      await parseJsonOrDiagnose(res, url);
      return true;
    } catch {
      return false;
    }
  },
  listProducts: () => req<any[]>(`/admin/products`),
  createProduct: (input: AdminProductInput) =>
    req(`/admin/products`, { method: "POST", body: JSON.stringify(input) }),
  updateProduct: (id: string, input: AdminProductInput) =>
    req(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteProduct: (id: string) => req(`/admin/products/${id}`, { method: "DELETE" }),
  updateInventory: (sku: string, inventory: number) =>
    req(`/admin/variants/${sku}/inventory`, { method: "PATCH", body: JSON.stringify({ inventory }) }),
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const url = `${BASE}/admin/uploads`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "x-admin-key": getAdminKey() || "" }, // no Content-Type — browser sets multipart boundary
      body: formData,
    });
    if (res.status === 401) {
      clearAdminKey();
      window.location.href = "/admin/login";
      throw new Error("Unauthorized");
    }
    const data = await parseJsonOrDiagnose(res, url);
    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }
    return `${API_ORIGIN}${data.url}`;
  },
};
