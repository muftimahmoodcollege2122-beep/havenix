function normalizeApiOrigin(raw: string): string {
  const trimmed = raw.replace(/\/+$/, "");
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const API_ORIGIN = normalizeApiOrigin(import.meta.env.VITE_API_URL || "");
const BASE = `${API_ORIGIN}/api`;
const TOKEN_KEY = "havenix_customer_token";

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
  const token = localStorage.getItem(TOKEN_KEY);
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await parseJsonOrDiagnose(res, url);
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
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
