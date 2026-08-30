import { NextResponse } from "next/server";
import { api, BASE, ApiError } from "@/lib/api";

// Temporary diagnostic route. Runs on the server (same environment as page.tsx
// SSR fetches), so it reveals whether Vercel's server can actually reach the
// Railway backend — a different network path than a browser-side health check.
// Reveals no secrets, only connectivity metadata.
export async function GET() {
  const report: Record<string, unknown> = {
    runsOn: "server (same environment as product/order page SSR fetches)",
    env: {
      API_URL_isSet: Boolean(process.env.API_URL),
      NEXT_PUBLIC_API_URL_isSet: Boolean(process.env.NEXT_PUBLIC_API_URL),
      NEXT_PUBLIC_API_URL_value: process.env.NEXT_PUBLIC_API_URL || null,
      // API_URL's actual value isn't included in case it ever holds something
      // sensitive by mistake — only whether it's set and what it resolves to below.
    },
    resolvedBaseUrl: BASE,
  };

  try {
    const start = Date.now();
    const health = await api.health();
    report.healthCheck = { ok: true, tookMs: Date.now() - start, response: health };
  } catch (err) {
    report.healthCheck = {
      ok: false,
      errorMessage: err instanceof Error ? err.message : String(err),
      status: err instanceof ApiError ? err.status : null,
    };
  }

  return NextResponse.json(report);
}
