"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("from") || "/account";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-[26px] text-ink mb-2 text-center">Welcome Back</h1>
      <p className="text-muted text-[14px] text-center mb-8">Log in to view your orders and account details.</p>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] tracking-widest uppercase text-muted">Password</label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-rose text-[13px] bg-rose/5 border border-rose/20 rounded-sm px-3 py-2">{error}</p>
        )}
        <button
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-espresso text-cream py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="text-center text-[13px] text-muted mt-6">
        New to Havenix?{" "}
        <Link href="/signup" className="text-clay underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-[420px] mx-auto px-6 py-16 text-center text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
