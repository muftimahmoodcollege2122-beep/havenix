"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="bg-paper border-t border-line">
      <div className="max-w-[1440px] mx-auto px-6 py-14 grid md:grid-cols-2 gap-8 items-center">
        <Reveal>
          <div className="font-serif text-[22px] text-ink mb-2">Be The First To Know</div>
          <p className="text-muted text-[14px] mb-5">Sign up for new arrivals, exclusive offers, and more.</p>
          {subscribed ? (
            <p className="text-clay text-sm" style={{ animation: "fadeUp 0.5s ease-out both" }}>
              Thanks for subscribing!
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSubscribed(true);
              }}
              className="flex gap-3 max-w-md"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Enter your email"
                className="flex-1 bg-cream border border-line px-4 py-3 text-sm outline-none focus:border-clay transition-colors duration-300"
              />
              <Magnetic>
                <button className="bg-espresso text-cream px-6 py-3 text-[12px] tracking-widest uppercase hover:bg-ink transition-colors duration-300 active:scale-95">
                  Subscribe
                </button>
              </Magnetic>
            </form>
          )}
        </Reveal>
        <Reveal delay={150} className="grid grid-cols-3 gap-6 text-[12px] text-muted text-center md:text-left">
          <div>
            <div className="text-ink font-medium mb-1">Exclusive Offers</div>
            for subscribers
          </div>
          <div>
            <div className="text-ink font-medium mb-1">Early Access</div>
            to new collections
          </div>
          <div>
            <div className="text-ink font-medium mb-1">Special Treats</div>
            just for you
          </div>
        </Reveal>
      </div>
    </section>
  );
}
