"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartFx } from "@/context/CartFxContext";
import { playAddToCartChime } from "@/lib/sound";

const FLIGHT_DURATION = 0.75;

export default function FlyToCartOverlay() {
  const { flights, completeFlight } = useCartFx();

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {flights.map((flight) => (
          <Flight key={flight.id} flight={flight} onDone={() => completeFlight(flight.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Flight({
  flight,
  onDone,
}: {
  flight: import("@/context/CartFxContext").Flight;
  onDone: () => void;
}) {
  const { imageSrc, startRect, endRect } = flight;
  const endCenterX = endRect.left + endRect.width / 2;
  const endCenterY = endRect.top + endRect.height / 2;
  const startCenterX = startRect.left + startRect.width / 2;
  const startCenterY = startRect.top + startRect.height / 2;

  // Animate via transform (x/y/scale) rather than left/top — these are true
  // motion values Framer Motion tracks reliably, so onAnimationComplete is
  // guaranteed to fire (unlike animating raw "position"/"left"/"top" strings).
  const dx = endCenterX - startCenterX;
  const dy = endCenterY - startCenterY;
  // A little lift partway through so the path arcs instead of cutting a straight line.
  const midY = Math.min(startCenterY, endCenterY) - 60 - startCenterY;

  // Safety net: if the tab loses focus, a route change interrupts things, or
  // Framer Motion for any reason doesn't fire onAnimationComplete, force the
  // clone to clear itself so it can never get stuck on screen permanently.
  useEffect(() => {
    const t = setTimeout(onDone, (FLIGHT_DURATION + 0.5) * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.img
      src={imageSrc}
      alt=""
      style={{
        position: "fixed",
        left: startRect.left,
        top: startRect.top,
        width: startRect.width,
        height: startRect.height,
        borderRadius: 8,
        objectFit: "cover",
        pointerEvents: "none",
      }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: [0, dx * 0.55, dx],
        y: [0, midY, dy],
        scale: [1, 0.28, 0.06],
        opacity: [1, 1, 0.4],
      }}
      transition={{
        duration: FLIGHT_DURATION,
        times: [0, 0.45, 1],
        ease: ["easeOut", "easeIn"],
      }}
      onAnimationComplete={() => {
        onDone();
        playAddToCartChime();
        import("canvas-confetti").then(({ default: confetti }) => {
          confetti({
            particleCount: 22,
            spread: 55,
            startVelocity: 22,
            gravity: 1.1,
            scalar: 0.65,
            ticks: 90,
            colors: ["#c98a63", "#e7c9b8", "#3d2b1f", "#f6ede4"],
            origin: {
              x: endCenterX / window.innerWidth,
              y: endCenterY / window.innerHeight,
            },
            disableForReducedMotion: true,
          });
        });
      }}
      className="shadow-lg"
    />
  );
}
