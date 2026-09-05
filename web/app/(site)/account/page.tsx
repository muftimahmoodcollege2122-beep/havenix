"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Users,
  Ruler,
  CreditCard,
  RotateCcw,
  Settings,
  LogOut,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import VerifyContact from "@/components/VerifyContact";
import type { Order, FamilyProfile, Customer } from "@/lib/types";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: Package },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "family", label: "Family Profiles", icon: Users },
  { key: "sizes", label: "Size Profiles", icon: Ruler },
  { key: "payments", label: "Payment Methods", icon: CreditCard },
  { key: "returns", label: "Returns", icon: RotateCcw },
  { key: "settings", label: "Account Settings", icon: Settings },
];

interface AccountData {
  customer: { name: string; email: string };
  stats: { totalOrders: number; wishlistItems: number; activeReturns: number };
  orders: Order[];
  familyProfiles: FamilyProfile[];
}

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { customer, loading: authLoading, logout } = useAuth();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [data, setData] = useState<AccountData | null>(null);
  const [active, setActive] = useState(initialTab);

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login?from=/account");
    }
  }, [authLoading, customer, router]);

  useEffect(() => {
    if (customer) api.getAccount().then((d) => setData(d as AccountData));
  }, [customer]);

  if (authLoading || !customer || !data) {
    return <div className="max-w-[1440px] mx-auto px-6 py-20 text-center text-muted">Loading...</div>;
  }

  const initials =
    data.customer.name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const needsVerification = !customer.emailVerified || !customer.phoneVerified;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-10 w-full">
        <aside className="min-w-0 w-full">
          <div className="flex items-center justify-between gap-3 mb-4 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-full bg-blush flex items-center justify-center text-ink font-serif text-[15px]">
                {initials}
              </div>
              <div>
                <div className="text-[11px] text-muted">Welcome back</div>
                <div className="text-[14px] text-ink">{data.customer.name.split(" ")[0]}</div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="md:hidden flex items-center gap-1.5 text-[12px] text-ink/60 hover:text-ink px-2 py-1.5"
              aria-label="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>

          <nav className="flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setActive(n.key)}
                className={`shrink-0 flex items-center gap-2.5 md:gap-3 px-3.5 py-2.5 text-[12.5px] md:text-[13px] rounded-full md:rounded transition-colors whitespace-nowrap border md:border-0 ${
                  active === n.key
                    ? "bg-espresso text-cream border-espresso"
                    : "text-ink/80 border-line hover:bg-paper md:hover:bg-paper"
                }`}
              >
                <n.icon size={15} />
                {n.label}
              </button>
            ))}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="hidden md:flex w-full items-center gap-3 px-3 py-2.5 text-[13px] text-ink/60 hover:bg-paper rounded mt-4"
            >
              <LogOut size={15} />
              Logout
            </button>
          </nav>
        </aside>

        <div className="min-w-0">
          {needsVerification && active === "dashboard" && (
            <VerificationBanner customer={customer} onGoToSettings={() => setActive("settings")} />
          )}
          {active === "dashboard" && <Dashboard data={data} />}
          {active === "orders" && <OrdersList orders={data.orders} />}
          {active === "family" && <FamilyList profiles={data.familyProfiles} />}
          {active === "settings" && <AccountSettings customer={customer} />}
          {["wishlist", "addresses", "sizes", "payments", "returns"].includes(active) && (
            <div className="text-muted text-sm py-16 text-center capitalize">{active} — nothing here yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="max-w-[1440px] mx-auto px-6 py-20 text-center text-muted">Loading...</div>}>
      <AccountContent />
    </Suspense>
  );
}

function VerificationBanner({ customer, onGoToSettings }: { customer: Customer; onGoToSettings: () => void }) {
  const missing = [!customer.emailVerified && "email", !customer.phoneVerified && "mobile number"].filter(
    Boolean
  ) as string[];
  return (
    <button
      onClick={onGoToSettings}
      className="w-full flex items-center gap-3 border border-clay/30 bg-blush/40 rounded-sm px-4 py-3.5 mb-8 text-left hover:bg-blush/60 transition-colors"
    >
      <AlertCircle size={18} className="text-clay shrink-0" />
      <span className="text-[13px] text-ink">
        Please verify your {missing.join(" and ")} to secure your account.{" "}
        <span className="text-clay underline underline-offset-2">Verify now</span>
      </span>
    </button>
  );
}

function Dashboard({ data }: { data: AccountData }) {
  return (
    <div>
      <h1 className="text-[20px] tracking-wide text-ink mb-1">{data.customer.name}</h1>
      <p className="text-muted text-[13px] mb-8">{data.customer.email}</p>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-5 mb-10">
        <Stat label="Total Orders" value={data.stats.totalOrders} />
        <Stat label="Wishlist Items" value={data.stats.wishlistItems} />
        <Stat label="Active Returns" value={data.stats.activeReturns} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] tracking-widest uppercase text-ink">Recent Orders</h2>
        <span className="text-[12px] text-clay">View All</span>
      </div>
      <div className="border border-line rounded-sm divide-y divide-line mb-10">
        {data.orders.length === 0 && <div className="px-4 sm:px-5 py-6 text-[13px] text-muted">No orders yet.</div>}
        {data.orders.map((o: Order) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 hover:bg-paper transition-colors"
          >
            <div>
              <div className="text-[13px] text-ink">{o.id}</div>
              <div className="text-[11px] text-muted">{o.placedOn}</div>
            </div>
            <div className={`text-[12px] ${o.status === "Delivered" ? "text-clay" : "text-muted"}`}>{o.status}</div>
            <div className="text-[13px] font-medium text-ink">PKR {o.total.toLocaleString()}</div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] tracking-widest uppercase text-ink">Family Profiles</h2>
        <span className="text-[12px] text-clay">Edit</span>
      </div>
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {data.familyProfiles.map((c: FamilyProfile) => (
          <div key={c.id} className="flex items-center gap-3 border border-line rounded-sm px-4 py-3">
            <div className="w-9 h-9 shrink-0 rounded-full bg-blush flex items-center justify-center text-[12px] font-serif">
              {c.name[0]}
            </div>
            <div className="text-[12px]">
              <div className="text-ink">{c.name}</div>
              <div className="text-muted">
                {c.heightCm}cm · {c.weightKg}kg
              </div>
            </div>
          </div>
        ))}
        <button className="border border-dashed border-line rounded-sm px-4 py-3 text-[12px] text-muted hover:border-clay hover:text-clay transition-colors">
          + Add Family Profile
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line rounded-sm px-2.5 sm:px-5 py-3 sm:py-4">
      <div className="text-[17px] sm:text-[22px] font-serif text-ink">{String(value).padStart(2, "0")}</div>
      <div className="text-[9.5px] sm:text-[11px] text-muted mt-1 leading-tight">{label}</div>
    </div>
  );
}

function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <div>
      <h1 className="text-[20px] tracking-wide text-ink mb-6">Orders</h1>
      <div className="border border-line rounded-sm divide-y divide-line">
        {orders.length === 0 && <div className="px-4 sm:px-5 py-6 text-[13px] text-muted">No orders yet.</div>}
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 hover:bg-paper transition-colors"
          >
            <div>
              <div className="text-[13px] text-ink">{o.id}</div>
              <div className="text-[11px] text-muted">
                {o.placedOn} · {o.items.length} item(s)
              </div>
            </div>
            <div className={`text-[12px] ${o.status === "Delivered" ? "text-clay" : "text-muted"}`}>{o.status}</div>
            <div className="text-[13px] font-medium text-ink">PKR {o.total.toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FamilyList({ profiles }: { profiles: FamilyProfile[] }) {
  return (
    <div>
      <h1 className="text-[20px] tracking-wide text-ink mb-6">Family Profiles</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {profiles.map((c) => (
          <div key={c.id} className="border border-line rounded-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-blush flex items-center justify-center font-serif text-[16px]">
              {c.name[0]}
            </div>
            <div className="text-[13px]">
              <div className="text-ink">{c.name}</div>
              <div className="text-muted">
                {c.heightCm}cm · {c.weightKg}kg
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountSettings({ customer }: { customer: Customer }) {
  const { refreshMe } = useAuth();
  const [verifying, setVerifying] = useState<"email" | "phone" | null>(null);
  const [phoneInput, setPhoneInput] = useState(customer.phone || "");

  return (
    <div className="max-w-[520px]">
      <h1 className="text-[20px] tracking-wide text-ink mb-6">Account Settings</h1>

      <div className="space-y-3">
        <ContactRow
          icon={<Mail size={16} />}
          label="Email"
          value={customer.email}
          verified={customer.emailVerified}
          onVerify={() => setVerifying("email")}
        />
        <ContactRow
          icon={<Phone size={16} />}
          label="Mobile Number"
          value={customer.phone || "Not added"}
          verified={customer.phoneVerified}
          onVerify={() => setVerifying("phone")}
        />
      </div>

      {verifying === "email" && (
        <div className="mt-8 border border-line rounded-sm p-6 sm:p-8">
          <VerifyContact
            icon={<Mail size={20} className="text-espresso" />}
            title="Verify your email"
            description={`Enter the 6-digit code we sent to ${customer.email}.`}
            send={() => api.sendEmailOtp()}
            confirm={(code) => api.confirmEmailOtp(code)}
            autoSendOnMount
            onCancel={() => setVerifying(null)}
            onVerified={async () => {
              await refreshMe();
              setVerifying(null);
            }}
          />
        </div>
      )}

      {verifying === "phone" && (
        <div className="mt-8 border border-line rounded-sm p-6 sm:p-8">
          {!customer.phone || phoneInput !== customer.phone ? (
            <div className="mb-6">
              <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="03xx xxxxxxx"
                className="input"
              />
            </div>
          ) : null}
          <VerifyContact
            key={phoneInput}
            icon={<Phone size={20} className="text-espresso" />}
            title="Verify your mobile number"
            description={`Enter the 6-digit code we sent to ${phoneInput || "your number"}.`}
            send={() => api.sendPhoneOtp(phoneInput)}
            confirm={(code) => api.confirmPhoneOtp(code, phoneInput)}
            autoSendOnMount={!!phoneInput && phoneInput.length >= 7}
            onCancel={() => setVerifying(null)}
            onVerified={async () => {
              await refreshMe();
              setVerifying(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  verified,
  onVerify,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  verified: boolean;
  onVerify: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border border-line rounded-sm px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-muted shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="text-[11px] text-muted">{label}</div>
          <div className="text-[13px] text-ink truncate">{value}</div>
        </div>
      </div>
      {verified ? (
        <span className="flex items-center gap-1 text-[12px] text-clay shrink-0">
          <CheckCircle2 size={14} /> Verified
        </span>
      ) : (
        <button
          onClick={onVerify}
          className="text-[12px] text-espresso underline underline-offset-2 shrink-0 hover:text-ink"
        >
          Verify
        </button>
      )}
    </div>
  );
}
