import type { Metadata } from "next";
import { Truck, RotateCcw, Clock, ShieldCheck } from "lucide-react";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Havenix shipping timelines, costs, and our 15-day return and exchange policy.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Reveal className="text-center mb-12">
        <div className="text-[12px] tracking-widest uppercase text-clay mb-3">Customer Care</div>
        <h1 className="font-serif text-[32px] md:text-[40px] text-ink mb-3">Shipping & Returns</h1>
        <p className="text-muted text-[14px]">Everything you need to know, in plain terms.</p>
      </Reveal>

      <div className="grid sm:grid-cols-2 gap-5 mb-16">
        <InfoCard icon={<Truck size={20} />} title="Free Shipping" body="On all orders over PKR 10,000, within Pakistan." />
        <InfoCard icon={<Clock size={20} />} title="Delivery Time" body="3–5 business days domestic, 7–14 days international." />
        <InfoCard icon={<RotateCcw size={20} />} title="15-Day Returns" body="Unworn items with tags attached, no questions asked." />
        <InfoCard icon={<ShieldCheck size={20} />} title="Secure Checkout" body="Every order is protected end-to-end." />
      </div>

      <Reveal className="space-y-10">
        <Section title="Shipping">
          <p>
            Orders are processed within 1–2 business days. Once shipped, standard delivery within Pakistan
            takes 3–5 business days; international orders take 7–14 business days depending on destination.
          </p>
          <p>
            Shipping is free on all orders over PKR 10,000. Below that threshold, a flat shipping rate is
            calculated and shown at checkout before you pay.
          </p>
          <p>
            You&apos;ll receive a tracking link by email as soon as your order ships, and you can always
            check the latest status from your Order page.
          </p>
        </Section>

        <Section title="Returns & Exchanges">
          <p>
            We accept returns within 15 days of delivery, on unworn items with original tags still attached.
            To start a return, go to your account&apos;s Orders page and select the order you&apos;d like to
            return.
          </p>
          <p>
            Exchanges for a different size or color follow the same process — select &quot;exchange&quot;
            instead of &quot;return&quot; and choose the replacement variant. We&apos;ll ship it out once the
            original item is received and inspected.
          </p>
          <p>
            Refunds are issued to your original payment method within 5–7 business days of us receiving the
            returned item. Items marked Final Sale are not eligible for return or exchange.
          </p>
        </Section>

        <Section title="Damaged or Incorrect Items">
          <p>
            If something arrives damaged or isn&apos;t what you ordered, contact us within 48 hours of
            delivery with a photo of the item — we&apos;ll sort out a replacement or refund right away, at no
            cost to you.
          </p>
        </Section>
      </Reveal>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-line rounded-sm p-5 flex items-start gap-3">
      <span className="text-clay mt-0.5">{icon}</span>
      <div>
        <div className="text-[14px] text-ink mb-1">{title}</div>
        <div className="text-[12px] text-muted leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-[22px] text-ink mb-4">{title}</h2>
      <div className="space-y-3 text-[14px] text-muted leading-relaxed">{children}</div>
    </div>
  );
}
