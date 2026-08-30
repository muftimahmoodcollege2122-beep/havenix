import type { Metadata } from "next";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Havenix team — questions, orders, or anything else.",
};

export default function ContactPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Reveal className="text-center mb-12">
        <div className="text-[12px] tracking-widest uppercase text-clay mb-3">Get In Touch</div>
        <h1 className="font-serif text-[32px] md:text-[40px] text-ink mb-3">We&apos;d Love To Hear From You</h1>
        <p className="text-muted text-[14px] max-w-md mx-auto">
          Questions about an order, sizing, or anything else — reach out and we&apos;ll get back to you
          within one business day.
        </p>
      </Reveal>

      <div className="grid md:grid-cols-[1fr_360px] gap-10 md:gap-16 max-w-4xl mx-auto">
        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal delay={150} className="space-y-6">
          <ContactMethod icon={<Mail size={17} />} title="Email" value="hello@havenix.com" />
          <ContactMethod icon={<MessageCircle size={17} />} title="WhatsApp" value="Chat with us, live" />
          <ContactMethod icon={<Clock size={17} />} title="Response Time" value="Within 1 business day" />
          <ContactMethod icon={<MapPin size={17} />} title="Based In" value="Pakistan · Shipping worldwide" />
        </Reveal>
      </div>
    </div>
  );
}

function ContactMethod({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3 border border-line rounded-sm p-4">
      <span className="text-clay mt-0.5">{icon}</span>
      <div>
        <div className="text-[13px] text-ink">{title}</div>
        <div className="text-[12px] text-muted mt-0.5">{value}</div>
      </div>
    </div>
  );
}
