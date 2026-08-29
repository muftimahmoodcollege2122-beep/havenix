import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

type Phase = "polling" | "paid" | "failed" | "timeout";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 30; // ~60s

export default function PaymentReturn() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") || "";
  const navigate = useNavigate();
  const { refresh } = useCart();
  const [phase, setPhase] = useState<Phase>("polling");
  const attempts = useRef(0);

  useEffect(() => {
    if (!orderId) {
      setPhase("failed");
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const status: any = await api.getPaymentStatus(orderId);
        if (cancelled) return;

        if (status.paymentStatus === "paid") {
          setPhase("paid");
          await refresh(); // cart was cleared server-side once payment started
          setTimeout(() => navigate(`/orders/${orderId}`), 1200);
          return;
        }
        if (status.paymentStatus === "failed") {
          setPhase("failed");
          return;
        }

        attempts.current += 1;
        if (attempts.current >= MAX_ATTEMPTS) {
          setPhase("timeout");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setPhase("failed");
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, navigate, refresh]);

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      {phase === "polling" && (
        <>
          <Loader2 size={32} className="mx-auto text-clay animate-spin mb-5" />
          <h1 className="font-serif text-[22px] text-ink mb-2">Confirming your payment</h1>
          <p className="text-muted text-[14px]">This usually takes a few seconds. Please don't close this page.</p>
        </>
      )}
      {phase === "paid" && (
        <>
          <CheckCircle2 size={36} className="mx-auto text-clay mb-5" />
          <h1 className="font-serif text-[22px] text-ink mb-2">Payment confirmed</h1>
          <p className="text-muted text-[14px]">Redirecting to your order...</p>
        </>
      )}
      {phase === "failed" && (
        <>
          <XCircle size={36} className="mx-auto text-rose mb-5" />
          <h1 className="font-serif text-[22px] text-ink mb-2">Payment failed</h1>
          <p className="text-muted text-[14px] mb-6">Your card or wallet wasn't charged. You can try again.</p>
          <Link to="/checkout" className="bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase inline-block hover:bg-ink transition-colors">
            Back to Checkout
          </Link>
        </>
      )}
      {phase === "timeout" && (
        <>
          <Loader2 size={32} className="mx-auto text-muted mb-5" />
          <h1 className="font-serif text-[22px] text-ink mb-2">Still confirming</h1>
          <p className="text-muted text-[14px] mb-6">
            This is taking longer than expected. If money left your account, your order will update shortly —
            check your order status directly.
          </p>
          <Link to={`/orders/${orderId}`} className="bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase inline-block hover:bg-ink transition-colors">
            View Order Status
          </Link>
        </>
      )}
    </div>
  );
}
