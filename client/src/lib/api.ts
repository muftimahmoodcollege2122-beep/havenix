const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const BASE = `${API_ORIGIN}/api`;
const TOKEN_KEY = "havenix_customer_token";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  getProducts: (category?: string) => req(`/products${category ? `?category=${category}` : ""}`),
  getProduct: (slug: string) => req(`/products/${slug}`),
  search: (q: string) => req(`/search?q=${encodeURIComponent(q)}`),
  getCart: (cartId: string) => req(`/cart/${cartId}`),
  addToCart: (cartId: string, body: { productId: string; sku: string; qty?: number }) =>
    req(`/cart/${cartId}/items`, { method: "POST", body: JSON.stringify(body) }),
  updateCartItem: (cartId: string, sku: string, qty: number) =>
    req(`/cart/${cartId}/items/${sku}`, { method: "PATCH", body: JSON.stringify({ qty }) }),
  removeCartItem: (cartId: string, sku: string) =>
    req(`/cart/${cartId}/items/${sku}`, { method: "DELETE" }),
  getAccount: () => req(`/account`),
  getOrder: (id: string) => req(`/orders/${id}`),
  getSizeGuide: () => req(`/size-guide`),
  recommendSize: (heightCm: number, department: "women" | "men" | "kids" = "women") =>
    req(`/size-recommendation`, { method: "POST", body: JSON.stringify({ heightCm, department }) }),
  checkout: (body: unknown) => req(`/checkout`, { method: "POST", body: JSON.stringify(body) }),
  initiatePayment: (body: unknown) => req(`/payments/checkout`, { method: "POST", body: JSON.stringify(body) }),
  getPaymentStatus: (orderId: string) => req(`/payments/status/${orderId}`),
  mockCompletePayment: (reference: string, outcome: "success" | "failed") =>
    req(`/payments/mock-complete`, { method: "POST", body: JSON.stringify({ reference, outcome }) }),
  signup: (body: { name: string; email: string; password: string; phone?: string }) =>
    req(`/auth/signup`, { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    req(`/auth/login`, { method: "POST", body: JSON.stringify(body) }),
  me: () => req(`/auth/me`),
};
