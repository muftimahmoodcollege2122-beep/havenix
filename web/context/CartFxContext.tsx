"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";

export interface Flight {
  id: number;
  imageSrc: string;
  startRect: DOMRect;
  endRect: DOMRect;
}

interface CartFxContextType {
  registerBagIcon: (el: HTMLElement | null) => void;
  flyToBag: (sourceEl: HTMLElement, imageSrc: string) => void;
  flights: Flight[];
  completeFlight: (id: number) => void;
  /** Increments every time a flight lands — Header listens to this to bounce the bag icon. */
  bumpSignal: number;
}

const CartFxContext = createContext<CartFxContextType | null>(null);

export function CartFxProvider({ children }: { children: ReactNode }) {
  const bagRef = useRef<HTMLElement | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bumpSignal, setBumpSignal] = useState(0);
  const idRef = useRef(0);

  const registerBagIcon = useCallback((el: HTMLElement | null) => {
    bagRef.current = el;
  }, []);

  const flyToBag = useCallback((sourceEl: HTMLElement, imageSrc: string) => {
    const bagEl = bagRef.current;
    if (!bagEl || !sourceEl) return;
    const startRect = sourceEl.getBoundingClientRect();
    const endRect = bagEl.getBoundingClientRect();
    const id = ++idRef.current;
    setFlights((f) => [...f, { id, imageSrc, startRect, endRect }]);
  }, []);

  const completeFlight = useCallback((id: number) => {
    setFlights((f) => f.filter((fl) => fl.id !== id));
    setBumpSignal((n) => n + 1);
  }, []);

  return (
    <CartFxContext.Provider value={{ registerBagIcon, flyToBag, flights, completeFlight, bumpSignal }}>
      {children}
    </CartFxContext.Provider>
  );
}

export function useCartFx() {
  const ctx = useContext(CartFxContext);
  if (!ctx) throw new Error("useCartFx must be used within CartFxProvider");
  return ctx;
}
