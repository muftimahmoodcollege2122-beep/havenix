"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode, ElementType } from "react";

export default function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  y = 22,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  y?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as as "div"] ?? motion.div;

  if (prefersReducedMotion) {
    const Tag = as as any;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
