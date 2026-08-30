"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>This page couldn&apos;t load</h1>
          <p style={{ color: "#8A7C6E", marginBottom: "24px" }}>
            Something went wrong. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#3A2A20",
              color: "#FBF7F2",
              padding: "12px 28px",
              fontSize: "13px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
