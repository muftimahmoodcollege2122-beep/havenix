"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Phone, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import VerifyContact from "@/components/VerifyContact";

type Step = "details" | "email" | "phone" | "done";

const STEPS: { key: Step; label: string }[] = [
  { key: "details", label: "Account" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Mobile" },
];

function stepIndex(step: Step) {
  return STEPS.findIndex((s) => s.key === step);
}

export default function SignupPage() {
  const { signup, refreshMe, customer } = useAuth();

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (phone.trim().length < 7) {
      setError("Enter a valid mobile number — we'll text you a code to confirm it.");
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password, phone);
      setStep("email");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="max-w-[420px] mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-blush mx-auto flex items-center justify-center mb-5">
          <Check size={24} className="text-espresso" />
        </div>
        <h1 className="font-serif text-[26px] text-ink mb-2">You&apos;re all set</h1>
        <p className="text-muted text-[14px] mb-8">Your email and mobile number are verified.</p>
        <Link
          href="/account"
          className="inline-block bg-espresso text-cream px-8 py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors"
        >
          Go to My Account
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-serif text-[26px] text-ink mb-2 text-center">Create Your Account</h1>
      <p className="text-muted text-[14px] text-center mb-8">
        So we can keep you updated on your orders and new arrivals.
      </p>

      <StepIndicator current={step} />

      {step === "details" && (
        <form onSubmit={submitDetails} className="space-y-4 mt-8">
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
            <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Mobile Number</label>
            <input
              type="tel"
              required
              placeholder="03xx xxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
            <p className="text-[11px] text-muted mt-1">We&apos;ll text you a code to confirm it.</p>
          </div>
          <div>
            <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-muted mt-1">At least 8 characters.</p>
          </div>
          {error && <p className="text-rose text-[13px]">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-espresso text-cream py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Continue"}
          </button>
        </form>
      )}

      {step === "email" && (
        <div className="mt-8">
          <VerifyContact
            key="email"
            icon={<Mail size={20} className="text-espresso" />}
            title="Check your email"
            description={`Enter the 6-digit code we sent to ${maskEmail(email)}.`}
            send={() => api.sendEmailOtp()}
            confirm={(code) => api.confirmEmailOtp(code)}
            autoSendOnMount
            onVerified={async () => {
              await refreshMe();
              setStep("phone");
            }}
          />
        </div>
      )}

      {step === "phone" && (
        <div className="mt-8">
          <VerifyContact
            key="phone"
            icon={<Phone size={20} className="text-espresso" />}
            title="Confirm your mobile number"
            description={`Enter the 6-digit code we sent to ${maskPhone(phone)}.`}
            send={() => api.sendPhoneOtp(phone)}
            confirm={(code) => api.confirmPhoneOtp(code, phone)}
            autoSendOnMount
            onVerified={async () => {
              await refreshMe();
              setStep("done");
            }}
          />
        </div>
      )}

      {step === "details" && (
        <p className="text-center text-[13px] text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-clay underline underline-offset-2">
            Log in
          </Link>
        </p>
      )}
      {customer && step !== "details" && (
        <p className="text-center text-[12px] text-muted mt-6">
          You can finish this later from{" "}
          <Link href="/account" className="text-clay underline underline-offset-2">
            My Account
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const idx = stepIndex(current);
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 text-[11px] tracking-widest uppercase ${
              i <= idx ? "text-ink" : "text-muted/60"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                i < idx ? "bg-espresso text-cream" : i === idx ? "bg-clay text-cream" : "bg-line text-muted"
              }`}
            >
              {i < idx ? <Check size={11} /> : i + 1}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <span className="w-6 h-px bg-line" />}
        </div>
      ))}
    </div>
  );
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${"*".repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\s/g, "");
  return digits.length <= 4 ? digits : `${"*".repeat(digits.length - 4)}${digits.slice(-4)}`;
}
