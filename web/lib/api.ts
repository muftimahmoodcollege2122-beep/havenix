// Server components can reach the API container directly; the browser needs
// a public URL. Set NEXT_PUBLIC_API_URL for the browser and API_URL (falls
// back to the public one) for server-side fetches.
const BASE =
  typeof window === "undefined"
    ? `${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api`
    : `${process.env.NEXT_PUBLIC_API_URL || ""}/api`;

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  getProducts: (category?: string) =>
    req(`/products${category ? `?category=${category}` : ""}`, { next: { revalidate: 60 } } as RequestInit),
  getProduct: (slug: string) => req(`/products/${slug}`, { next: { revalidate: 60 } } as RequestInit),
  search: (q: string) => req(`/search?q=${encodeURIComponent(q)}`, { cache: "no-store" }),
  getCart: (cartId: string) => req(`/cart/${cartId}`, { cache: "no-store" }),
  addToCart: (cartId: string, body: { productId: string; sku: string; qty?: number }) =>
    req(`/cart/${cartId}/items`, { method: "POST", body: JSON.stringify(body) }),
  updateCartItem: (cartId: string, sku: string, qty: number) =>
    req(`/cart/${cartId}/items/${sku}`, { method: "PATCH", body: JSON.stringify({ qty }) }),
  removeCartItem: (cartId: string, sku: string) =>
    req(`/cart/${cartId}/items/${sku}`, { method: "DELETE" }),
  getAccount: () => req(`/account`, { cache: "no-store" }),
  getOrder: (id: string) => req(`/orders/${id}`, { cache: "no-store" }),
  getSizeGuide: () => req(`/size-guide`, { next: { revalidate: 3600 } } as RequestInit),
  recommendSize: (heightCm: number, department: "women" | "men" | "kids" = "women") =>
    req(`/size-recommendation`, { method: "POST", body: JSON.stringify({ heightCm, department }) }),
  checkout: (body: unknown) => req(`/checkout`, { method: "POST", body: JSON.stringify(body) }),
};
