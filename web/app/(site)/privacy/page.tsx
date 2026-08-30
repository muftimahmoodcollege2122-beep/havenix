import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Havenix collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Reveal className="mb-12">
        <div className="text-[12px] tracking-widest uppercase text-clay mb-3">Legal</div>
        <h1 className="font-serif text-[32px] md:text-[40px] text-ink mb-3">Privacy Policy</h1>
        <p className="text-muted text-[13px]">Last updated August 2026</p>
      </Reveal>

      <Reveal className="space-y-8 text-[14px] text-muted leading-relaxed">
        <LegalSection title="Information We Collect">
          <p>
            When you create an account, place an order, or contact us, we collect information you provide
            directly — your name, email address, phone number, shipping address, and order details. We do
            not store your full payment card details; those are handled directly by our payment providers.
          </p>
        </LegalSection>

        <LegalSection title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Process and fulfil your orders, including shipping and payment confirmation</li>
            <li>Communicate with you about your orders, account, and customer service requests</li>
            <li>Send marketing emails, only if you&apos;ve opted in — you can unsubscribe at any time</li>
            <li>Improve our products, website, and customer experience</li>
            <li>Detect and prevent fraud or abuse of our platform</li>
          </ul>
        </LegalSection>

        <LegalSection title="Sharing Your Information">
          <p>
            We share your information only with the third parties necessary to run our business: payment
            processors (JazzCash, EasyPaisa, card and bank transfer gateways) to complete transactions,
            shipping carriers to deliver your order, and service providers who help us operate the site. We
            do not sell your personal information to third parties.
          </p>
        </LegalSection>

        <LegalSection title="Cookies">
          <p>
            We use cookies and similar technologies to keep you logged in, remember your cart, and understand
            how our site is used so we can improve it. You can control cookies through your browser settings.
          </p>
        </LegalSection>

        <LegalSection title="Your Rights">
          <p>
            You can access, update, or delete your account information at any time from your Account
            dashboard. To request a full copy or deletion of your data, contact us at hello@havenix.com.
          </p>
        </LegalSection>

        <LegalSection title="Data Security">
          <p>
            We use industry-standard security measures — encrypted connections, secure password storage, and
            restricted access to personal data — to protect your information. No system is perfectly secure,
            but we take reasonable steps to keep your data safe.
          </p>
        </LegalSection>

        <LegalSection title="Changes to This Policy">
          <p>
            We may update this policy from time to time. Material changes will be reflected by an updated
            &quot;last updated&quot; date at the top of this page.
          </p>
        </LegalSection>

        <LegalSection title="Contact Us">
          <p>
            Questions about this policy or your data? Reach us at hello@havenix.com or through our{" "}
            <a href="/contact" className="text-clay underline underline-offset-2">
              Contact page
            </a>
            .
          </p>
        </LegalSection>
      </Reveal>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[16px] text-ink mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
