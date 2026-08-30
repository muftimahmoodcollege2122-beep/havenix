"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [health, setHealth] = useState<{ status: "idle" | "checking" | "done" }>({ status: "idle" });
  const [healthResult, setHealthResult] = useState<string>("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "(not set)";

  useEffect(() => {
    console.error("Storefront route error:", error, "digest:", error.digest);
  }, [error]);

  const checkConnection = async () => {
    setHealth({ status: "checking" });
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    const url = `${/^https?:\/\//i.test(base) ? base : `https://${base}`}/api/health`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();
      setHealthResult(`${res.status} ${res.statusText}\n${text.slice(0, 300)}`);
    } catch (e) {
      setHealthResult(`Fetch failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setHealth({ status: "done" });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-32 text-center">
      <div className="font-serif text-[40px] text-ink mb-3">This page couldn&apos;t load</div>
      <p className="text-muted mb-8 max-w-md mx-auto">
        Something went wrong reaching the store. This is usually temporary — try again in a moment.
      </p>
      <div className="flex items-center justify-center gap-4 mb-10">
        <button
          onClick={reset}
          className="bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="text-[13px] tracking-widest uppercase text-ink hover:text-clay transition-colors"
        >
          Back to Home
        </Link>
      </div>

      <div className="max-w-lg mx-auto text-left bg-paper border border-line rounded-sm p-5">
        <p className="text-[11px] text-muted mb-1">
          Configured API URL: <span className="text-clay break-all">{apiUrl}</span>
        </p>
        {error.digest && <p className="text-[11px] text-muted mb-3">Error digest: {error.digest}</p>}
        <button
          onClick={checkConnection}
          disabled={health.status === "checking"}
          className="text-[12px] text-clay underline underline-offset-2 disabled:opacity-50"
        >
          {health.status === "checking" ? "Checking..." : "Test API connection"}
        </button>
        {health.status === "done" && (
          <pre className="text-[11px] text-ink mt-3 whitespace-pre-wrap break-all">{healthResult}</pre>
        )}
      </div>
    </div>
  );
}
