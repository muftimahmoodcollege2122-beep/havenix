import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../lib/api";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  marketingOptIn: boolean;
}

interface AuthContextType {
  customer: Customer | null;
  loading: boolean;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = "havenix_customer_token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
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
      const data: any = await api.me();
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
    const data: any = await api.signup({ name, email, password, phone });
    setToken(data.token);
    setCustomer(data.customer);
  };

  const login = async (email: string, password: string) => {
    const data: any = await api.login({ email, password });
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
