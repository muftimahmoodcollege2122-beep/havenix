import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of Havenix and its services.",
};

export default function TermsPage() {
  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Reveal className="mb-12">
        <div className="text-[12px] tracking-widest uppercase text-clay mb-3">Legal</div>
        <h1 className="font-serif text-[32px] md:text-[40px] text-ink mb-3">Terms of Service</h1>
        <p className="text-muted text-[13px]">Last updated August 2026</p>
      </Reveal>

      <Reveal className="space-y-8 text-[14px] text-muted leading-relaxed">
        <LegalSection title="1. Agreement to Terms">
          <p>
            By accessing or using the Havenix website, you agree to be bound by these Terms of Service. If
            you do not agree, please do not use our site.
          </p>
        </LegalSection>

        <LegalSection title="2. Orders & Payment">
          <p>
            All orders are subject to product and payment verification. We reserve the right to refuse or
            cancel any order for reasons including inventory unavailability, pricing errors, or suspected
            fraudulent activity. Prices are listed in PKR and are subject to change without notice, though
            confirmed orders will honour the price shown at checkout.
          </p>
        </LegalSection>

        <LegalSection title="3. Shipping & Delivery">
          <p>
            Delivery timelines shown at checkout are estimates, not guarantees. Havenix is not liable for
            delays caused by circumstances outside our control, including carrier delays, customs processing,
            or incorrect shipping information provided by the customer.
          </p>
        </LegalSection>

        <LegalSection title="4. Returns & Exchanges">
          <p>
            Returns and exchanges are accepted within 15 days of delivery on unworn items with tags attached,
            as described in our{" "}
            <a href="/shipping-returns" className="text-clay underline underline-offset-2">
              Shipping & Returns policy
            </a>
            . Items marked Final Sale are excluded.
          </p>
        </LegalSection>

        <LegalSection title="5. Account Responsibility">
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activity under your account. Notify us immediately if you suspect unauthorized use.
          </p>
        </LegalSection>

        <LegalSection title="6. Intellectual Property">
          <p>
            All content on this site — including product photography, designs, logos, and text — is the
            property of Havenix and may not be reproduced or used without written permission.
          </p>
        </LegalSection>

        <LegalSection title="7. Limitation of Liability">
          <p>
            Havenix is not liable for indirect, incidental, or consequential damages arising from your use of
            the site or products purchased through it, to the extent permitted by applicable law.
          </p>
        </LegalSection>

        <LegalSection title="8. Changes to These Terms">
          <p>
            We may revise these terms at any time. Continued use of the site after changes are posted
            constitutes acceptance of the updated terms.
          </p>
        </LegalSection>

        <LegalSection title="9. Contact">
          <p>
            Questions about these terms? Reach us at hello@havenix.com or through our{" "}
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
