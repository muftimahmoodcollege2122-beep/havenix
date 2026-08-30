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
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Order, FamilyProfile } from "@/lib/types";

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

  const initials = data.customer.name
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid md:grid-cols-[240px_1fr] gap-8 md:gap-10">
        <aside>
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-11 h-11 rounded-full bg-blush flex items-center justify-center text-ink font-serif text-[15px]">
              {initials}
            </div>
            <div>
              <div className="text-[11px] text-muted">Welcome back</div>
              <div className="text-[14px] text-ink">{data.customer.name.split(" ")[0]}</div>
            </div>
          </div>
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setActive(n.key)}
                className={`shrink-0 flex items-center gap-3 px-3 py-2.5 text-[13px] rounded transition-colors whitespace-nowrap ${
                  active === n.key ? "bg-espresso text-cream" : "text-ink/80 hover:bg-paper"
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

        <div>
          {active === "dashboard" && <Dashboard data={data} />}
          {active === "orders" && <OrdersList orders={data.orders} />}
          {active === "family" && <FamilyList profiles={data.familyProfiles} />}
          {["wishlist", "addresses", "sizes", "payments", "returns", "settings"].includes(active) && (
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

function Dashboard({ data }: { data: AccountData }) {
  return (
    <div>
      <h1 className="text-[20px] tracking-wide text-ink mb-1">{data.customer.name}</h1>
      <p className="text-muted text-[13px] mb-8">{data.customer.email}</p>

      <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-10">
        <Stat label="Total Orders" value={data.stats.totalOrders} />
        <Stat label="Wishlist Items" value={data.stats.wishlistItems} />
        <Stat label="Active Returns" value={data.stats.activeReturns} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] tracking-widest uppercase text-ink">Recent Orders</h2>
        <span className="text-[12px] text-clay">View All</span>
      </div>
      <div className="border border-line rounded-sm divide-y divide-line mb-10">
        {data.orders.map((o: Order) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 hover:bg-paper transition-colors">
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
      <div className="flex flex-wrap gap-4">
        {data.familyProfiles.map((c: FamilyProfile) => (
          <div key={c.id} className="flex items-center gap-3 border border-line rounded-sm px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-blush flex items-center justify-center text-[12px] font-serif">
              {c.name[0]}
            </div>
            <div className="text-[12px]">
              <div className="text-ink">{c.name}</div>
              <div className="text-muted">{c.heightCm}cm · {c.weightKg}kg</div>
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
    <div className="border border-line rounded-sm px-3 sm:px-5 py-3 sm:py-4">
      <div className="text-[18px] sm:text-[22px] font-serif text-ink">{String(value).padStart(2, "0")}</div>
      <div className="text-[10px] sm:text-[11px] text-muted mt-1">{label}</div>
    </div>
  );
}

function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <div>
      <h1 className="text-[20px] tracking-wide text-ink mb-6">Orders</h1>
      <div className="border border-line rounded-sm divide-y divide-line">
        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 hover:bg-paper transition-colors">
            <div>
              <div className="text-[13px] text-ink">{o.id}</div>
              <div className="text-[11px] text-muted">{o.placedOn} · {o.items.length} item(s)</div>
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
            <div className="w-12 h-12 rounded-full bg-blush flex items-center justify-center font-serif text-[16px]">
              {c.name[0]}
            </div>
            <div className="text-[13px]">
              <div className="text-ink">{c.name}</div>
              <div className="text-muted">{c.heightCm}cm · {c.weightKg}kg</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
