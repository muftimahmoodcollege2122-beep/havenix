// Server components can reach the API container directly; the browser needs
// a public URL. Set NEXT_PUBLIC_API_URL for the browser and API_URL (falls
// back to the public one) for server-side fetches.
const BASE =
  typeof window === "undefined"
    ? `${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api`
    : `${process.env.NEXT_PUBLIC_API_URL || ""}/api`;

const TOKEN_KEY = "havenix_customer_token";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
      ...options,
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected response from ${path}: ${text.slice(0, 200)}`);
    }
    if (!res.ok) {
      const err = data as { error?: string };
      throw new Error(err.error || "Request failed");
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
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
  initiatePayment: (body: unknown) => req(`/payments/checkout`, { method: "POST", body: JSON.stringify(body) }),
  getPaymentStatus: (orderId: string) => req(`/payments/status/${orderId}`, { cache: "no-store" }),
  mockCompletePayment: (reference: string, outcome: "success" | "failed") =>
    req(`/payments/mock-complete`, { method: "POST", body: JSON.stringify({ reference, outcome }) }),
  signup: (body: { name: string; email: string; password: string; phone?: string }) =>
    req(`/auth/signup`, { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    req(`/auth/login`, { method: "POST", body: JSON.stringify(body) }),
  me: () => req(`/auth/me`, { cache: "no-store" }),
};

export { getAuthToken };
