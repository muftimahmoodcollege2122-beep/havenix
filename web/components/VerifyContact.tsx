"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { ApiError } from "@/lib/api";
import OtpInput from "@/components/OtpInput";

export default function VerifyContact({
  icon,
  title,
  description,
  send,
  confirm,
  onVerified,
  onCancel,
  autoSendOnMount,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  send: () => Promise<unknown>;
  confirm: (code: string) => Promise<unknown>;
  onVerified: () => void | Promise<void>;
  onCancel?: () => void;
  autoSendOnMount?: boolean;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const sentOnce = useRef(false);

  const doSend = async (silent = false) => {
    setError("");
    if (!silent) setInfo("");
    setSending(true);
    try {
      await send();
      setCooldown(45);
      if (!silent) setInfo("A new code is on its way.");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not send the code. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (autoSendOnMount && !sentOnce.current) {
      sentOnce.current = true;
      doSend(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const doConfirm = async (value: string) => {
    setError("");
    setVerifying(true);
    try {
      await confirm(value);
      await onVerified();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Verification failed.");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-blush mx-auto flex items-center justify-center mb-4">{icon}</div>
      <h2 className="text-[16px] text-ink mb-1">{title}</h2>
      <p className="text-muted text-[13px] mb-6">{description}</p>

      <OtpInput value={code} onChange={setCode} onComplete={doConfirm} disabled={verifying} />

      {error && <p className="text-rose text-[13px] mt-4">{error}</p>}
      {info && !error && <p className="text-clay text-[13px] mt-4">{info}</p>}

      <button
        onClick={() => doConfirm(code)}
        disabled={code.length !== 6 || verifying}
        className="w-full bg-espresso text-cream py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50 mt-6"
      >
        {verifying ? "Verifying..." : "Verify"}
      </button>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => doSend(false)}
          disabled={sending || cooldown > 0}
          className="text-[12px] text-muted hover:text-clay transition-colors disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : sending ? "Sending..." : "Resend code"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="text-[12px] text-muted hover:text-ink transition-colors">
            Cancel
          </button>
        )}
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted mt-6">
        <ShieldCheck size={12} /> Codes expire after 10 minutes.
      </p>
    </div>
  );
}
