"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront route error:", error);
  }, [error]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-32 text-center">
      <div className="font-serif text-[40px] text-ink mb-3">This page couldn&apos;t load</div>
      <p className="text-muted mb-8 max-w-md mx-auto">
        Something went wrong reaching the store. This is usually temporary — try again in a moment.
      </p>
      <div className="flex items-center justify-center gap-4">
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
    </div>
  );
}
