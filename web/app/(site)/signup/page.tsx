"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password, phone);
      router.push("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-[26px] text-ink mb-2 text-center">Create Your Account</h1>
      <p className="text-muted text-[14px] text-center mb-8">
        So we can keep you updated on your orders and new arrivals.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Full Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">
            Phone (for order updates)
          </label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
        </div>
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <p className="text-[11px] text-muted mt-1">At least 8 characters.</p>
        </div>
        {error && <p className="text-rose text-[13px]">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-espresso text-cream py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-[13px] text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-clay underline underline-offset-2">
          Log in
        </Link>
      </p>
    </div>
  );
}
