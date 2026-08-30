"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, setAdminKey, getAdminKey } from "@/lib/adminApi";

export default function AdminLoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (getAdminKey()) {
      router.push("/admin/products");
    }
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const trimmedKey = key.trim();
    try {
      const ok = await adminApi.login(trimmedKey);
      if (ok) {
        setAdminKey(trimmedKey);
        router.push("/admin/products");
      } else {
        setError("Invalid admin key.");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-serif text-[26px] tracking-[0.15em] text-cream">HAVENIX</div>
          <div className="text-[10px] tracking-[0.35em] text-clay mt-1">ADMIN</div>
        </div>
        <form onSubmit={submit} className="bg-cream p-8 rounded-sm">
          <label className="block text-[12px] tracking-widest uppercase text-muted mb-2">
            Admin Key
          </label>
          <input
            autoFocus
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-paper border border-line px-4 py-3 text-sm outline-none focus:border-clay transition-colors mb-4"
            placeholder="Enter admin key"
          />
          {error && <p className="text-rose text-[13px] mb-4">{error}</p>}
          <button
            disabled={loading || !key.trim()}
            className="w-full bg-espresso text-cream py-3 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
          >
            {loading ? "Checking..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
