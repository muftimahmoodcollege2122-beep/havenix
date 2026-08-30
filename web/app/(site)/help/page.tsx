import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers to common questions about orders, shipping, sizing, and returns at Havenix.",
};

const FAQ_GROUPS = [
  {
    title: "Orders & Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept JazzCash, EasyPaisa, Visa/Mastercard, direct bank transfer, and cash on delivery in eligible areas.",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "If your order hasn't been packed yet, contact us right away and we'll do our best to adjust it. Once it's shipped, it can't be changed.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order ships, you'll get a tracking link by email — or you can find it anytime in your account under Orders.",
      },
    ],
  },
  {
    title: "Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery within Pakistan typically takes 3–5 business days. International orders take 7–14 business days depending on destination.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship worldwide. Shipping costs and timelines are calculated at checkout based on your address.",
      },
      {
        q: "Is shipping free?",
        a: "Orders over PKR 10,000 qualify for free standard shipping. Below that, a flat shipping rate applies at checkout.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        q: "What's your return policy?",
        a: "We accept returns within 15 days of delivery on unworn items with tags attached. Visit your Order page to start a return.",
      },
      {
        q: "How do I exchange for a different size?",
        a: "Start a return request from your order, choose 'exchange', and select the new size — we'll ship the replacement once the original is received.",
      },
      {
        q: "When will I get my refund?",
        a: "Refunds are processed within 5–7 business days after we receive your returned item, back to your original payment method.",
      },
    ],
  },
  {
    title: "Sizing",
    items: [
      {
        q: "How do I find my size?",
        a: "Check our Size Guide for detailed measurements across Women's, Men's, and Kids' sizing, or use the size recommendation tool on any product page.",
      },
      {
        q: "Do your sizes run true to standard sizing?",
        a: "Yes — each product page lists exact measurements so you can compare against pieces you already own.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Reveal className="text-center mb-12">
        <div className="text-[12px] tracking-widest uppercase text-clay mb-3">Help Center</div>
        <h1 className="font-serif text-[32px] md:text-[40px] text-ink mb-3">Frequently Asked Questions</h1>
        <p className="text-muted text-[14px]">
          Can&apos;t find what you&apos;re looking for?{" "}
          <Link href="/contact" className="text-clay underline underline-offset-2">
            Contact us
          </Link>{" "}
          directly.
        </p>
      </Reveal>

      <FaqAccordion groups={FAQ_GROUPS} />
    </div>
  );
}
