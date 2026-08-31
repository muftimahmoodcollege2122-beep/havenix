// Server components can reach the API container directly; the browser needs
// a public URL. Set NEXT_PUBLIC_API_URL for the browser and API_URL (falls
// back to the public one) for server-side fetches.
function normalizeApiOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  // A bare domain (e.g. "myapp.up.railway.app") is a valid relative URL, so
  // fetch() silently resolves it against the current page's own origin
  // instead of erroring — auto-add the scheme so this can't fail silently.
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const BASE =
  typeof window === "undefined"
    ? `${normalizeApiOrigin(process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")}/api`
    : `${normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL || "")}/api`;

export { BASE };

const TOKEN_KEY = "havenix_customer_token";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const controller = new AbortController();
  // Server-side (SSR) requests get more slack — a cold-started backend
  // (e.g. Railway free tier waking up) can take a while to answer the
  // first request after idling.
  const timeoutMs = typeof window === "undefined" ? 15000 : 8000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
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
      throw new ApiError(`Unexpected response from ${path}: ${text.slice(0, 200)}`, res.status);
    }
    if (!res.ok) {
      const err = data as { error?: string };
      throw new ApiError(err.error || "Request failed", res.status);
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Network failure, timeout/abort, DNS error, etc. — not an HTTP response at all.
    throw new ApiError(err instanceof Error ? err.message : "Network request failed", 0);
  } finally {
    clearTimeout(timeout);
  }
}

export { ApiError };

export const api = {
  health: () => req(`/health`, { cache: "no-store" }),
  getProducts: (category?: string) =>
    req(`/products${category ? `?category=${category}` : ""}`, { next: { revalidate: 60 } } as RequestInit),
  getProduct: (slug: string) => req(`/products/${slug}`, { cache: "no-store" }),
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
  submitContact: (body: { name: string; email: string; subject: string; message: string }) =>
    req(`/contact`, { method: "POST", body: JSON.stringify(body) }),
  getReviews: (slug: string) => req(`/products/${slug}/reviews`, { cache: "no-store" }),
  submitReview: (slug: string, body: { rating: number; title?: string; body?: string }) =>
    req(`/products/${slug}/reviews`, { method: "POST", body: JSON.stringify(body) }),
  deleteReview: (id: string) => req(`/reviews/${id}`, { method: "DELETE" }),
};

export { getAuthToken };
