"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCartFx } from "@/context/CartFxContext";
import { playAddToCartChime } from "@/lib/sound";

export default function FlyToCartOverlay() {
  const { flights, completeFlight } = useCartFx();

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true">
      <AnimatePresence>
        {flights.map((flight) => {
          const { id, imageSrc, startRect, endRect } = flight;
          const endCenterX = endRect.left + endRect.width / 2;
          const endCenterY = endRect.top + endRect.height / 2;
          // A little lift partway through so the path arcs instead of cutting a straight line.
          const midX = startRect.left + (endCenterX - startRect.left) * 0.55;
          const midY = Math.min(startRect.top, endCenterY) - 60;

          return (
            <motion.img
              key={id}
              src={imageSrc}
              alt=""
              initial={{
                position: "fixed",
                left: startRect.left,
                top: startRect.top,
                width: startRect.width,
                height: startRect.height,
                borderRadius: 8,
                opacity: 1,
                objectFit: "cover",
              }}
              animate={{
                left: [startRect.left, midX, endCenterX - 12],
                top: [startRect.top, midY, endCenterY - 12],
                width: [startRect.width, 72, 24],
                height: [startRect.height, 88, 24],
                borderRadius: [8, 10, 999],
                opacity: [1, 1, 0.5],
              }}
              transition={{
                duration: 0.75,
                times: [0, 0.45, 1],
                ease: ["easeOut", "easeIn"],
              }}
              onAnimationComplete={() => {
                completeFlight(id);
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
              style={{ position: "fixed", pointerEvents: "none" }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
