import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../lib/api";
import type { CartSummary } from "../types";

interface CartContextType {
  cart: CartSummary;
  loading: boolean;
  addItem: (productId: string, sku: string, qty?: number) => Promise<void>;
  updateItem: (sku: string, qty: number) => Promise<void>;
  removeItem: (sku: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const emptyCart: CartSummary = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
  freeShippingRemaining: 10000,
};

function getCartId() {
  let id = localStorage.getItem("havenix_cart_id");
  if (!id) {
    id = `cart_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem("havenix_cart_id", id);
  }
  return id;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartSummary>(emptyCart);
  const [loading, setLoading] = useState(false);
  const cartId = getCartId();

  const refresh = useCallback(async () => {
    try {
      const data = await api.getCart(cartId);
      setCart(data as CartSummary);
    } catch {
      // ignore
    }
  }, [cartId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId: string, sku: string, qty = 1) => {
    setLoading(true);
    try {
      const data = await api.addToCart(cartId, { productId, sku, qty });
      setCart(data as CartSummary);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (sku: string, qty: number) => {
    const data = await api.updateCartItem(cartId, sku, qty);
    setCart(data as CartSummary);
  };

  const removeItem = async (sku: string) => {
    const data = await api.removeCartItem(cartId, sku);
    setCart(data as CartSummary);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { getCartId };
