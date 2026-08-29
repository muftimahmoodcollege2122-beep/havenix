"use client";

import { useEffect, useState } from "react";

export default function IntroSplash({ onReveal }: { onReveal: () => void }) {
  const [phase, setPhase] = useState<"enter" | "exit" | "gone">("enter");

  useEffect(() => {
    if (sessionStorage.getItem("havenix_intro_seen")) {
      setPhase("gone");
      onReveal();
      return;
    }

    document.body.style.overflow = "hidden";

    const revealTimer = setTimeout(() => {
      setPhase("exit");
      document.body.style.overflow = "";
      onReveal();
      sessionStorage.setItem("havenix_intro_seen", "1");
    }, 1300);

    const goneTimer = setTimeout(() => setPhase("gone"), 2100);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(goneTimer);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-cream transition-opacity duration-700 ease-out ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="text-center">
        <div className="intro-logo font-serif text-[16px] md:text-[20px] tracking-[0.55em] uppercase text-ink">
          Havenix
        </div>
        <div className="intro-logo-line mt-4 h-px bg-clay mx-auto" />
      </div>
    </div>
  );
}
