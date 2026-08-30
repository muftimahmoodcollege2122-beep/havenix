"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";

interface AuthContextType {
  customer: Customer | null;
  loading: boolean;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = "havenix_customer_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const data = (await api.me()) as { customer: Customer };
      setCustomer(data.customer);
    } catch {
      clearToken();
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    const data = (await api.signup({ name, email, password, phone })) as { token: string; customer: Customer };
    setToken(data.token);
    setCustomer(data.customer);
  };

  const login = async (email: string, password: string) => {
    const data = (await api.login({ email, password })) as { token: string; customer: Customer };
    setToken(data.token);
    setCustomer(data.customer);
  };

  const logout = () => {
    clearToken();
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ customer, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { getToken };
