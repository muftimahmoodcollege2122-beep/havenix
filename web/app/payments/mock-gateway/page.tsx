"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, CreditCard, Smartphone, Landmark } from "lucide-react";
import { api } from "@/lib/api";

const METHOD_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  card: { label: "Visa / Mastercard", icon: <CreditCard size={18} /> },
  jazzcash: { label: "JazzCash", icon: <Smartphone size={18} /> },
  easypaisa: { label: "EasyPaisa", icon: <Smartphone size={18} /> },
  bank_transfer: { label: "Bank Transfer", icon: <Landmark size={18} /> },
};

function MockGatewayContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";
  const orderId = searchParams.get("orderId") || "";
  const amount = searchParams.get("amount") || "0";
  const method = searchParams.get("method") || "card";
  const returnUrl = searchParams.get("returnUrl") || "/";
  const [busy, setBusy] = useState(false);

  const complete = async (outcome: "success" | "failed") => {
    setBusy(true);
    try {
      await api.mockCompletePayment(reference, outcome);
    } catch {
      // proceed to return URL regardless — the return page polls real order status
    } finally {
      window.location.href = returnUrl;
    }
  };

  const methodInfo = METHOD_LABEL[method] || METHOD_LABEL.card;

  return (
    <div className="min-h-[80vh] bg-[#0f1115] flex items-center justify-center px-4 font-body -mx-4 sm:-mx-6">
      <div className="w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-2xl">
        <div className="bg-espresso text-cream px-6 py-4 text-center">
          <div className="font-serif text-[18px] tracking-widest">SIMULATED GATEWAY</div>
          <div className="text-[11px] text-cream/60 mt-1">Test mode — no real money moves</div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-[13px] text-ink mb-1">
            {methodInfo.icon}
            {methodInfo.label}
          </div>
          <div className="text-[11px] text-muted mb-5">Order {orderId}</div>

          <div className="bg-paper rounded-sm p-4 text-center mb-6">
            <div className="text-[11px] text-muted mb-1">Amount to pay</div>
            <div className="font-serif text-[28px] text-ink">PKR {Number(amount).toLocaleString()}</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => complete("success")}
              disabled={busy}
              className="w-full bg-espresso text-cream py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
            >
              {busy ? "Processing..." : "Pay Successfully"}
            </button>
            <button
              onClick={() => complete("failed")}
              disabled={busy}
              className="w-full border border-line text-ink py-3.5 text-[13px] tracking-widest uppercase hover:border-rose hover:text-rose transition-colors disabled:opacity-50"
            >
              Simulate Failure
            </button>
          </div>

          <div className="flex items-center gap-2 mt-6 text-[11px] text-muted justify-center">
            <ShieldCheck size={13} className="text-clay" />
            This screen stands in for JazzCash / EasyPaisa / card checkout until real gateway
            credentials are connected.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-muted">Loading...</div>}>
      <MockGatewayContent />
    </Suspense>
  );
}
