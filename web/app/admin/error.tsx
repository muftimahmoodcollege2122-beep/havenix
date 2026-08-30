"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center">
        <div className="font-serif text-[28px] text-ink mb-3">Admin panel couldn&apos;t load</div>
        <p className="text-muted mb-8">Something went wrong. Try again, or log back in if the issue persists.</p>
        <button
          onClick={reset}
          className="bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
