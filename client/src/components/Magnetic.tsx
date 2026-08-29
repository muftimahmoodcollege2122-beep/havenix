import { useRef, type PointerEvent, type ReactNode } from "react";

const MAX_OFFSET = 10; // px — keep the pull subtle, never exaggerated

export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    const x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, relX * strength));
    const y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, relY * strength));
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`magnetic-btn inline-block ${className}`}
    >
      {children}
    </div>
  );
}
