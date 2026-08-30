"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/Reveal";

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ groups }: { groups: { title: string; items: FaqItem[] }[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="text-[13px] tracking-widest uppercase text-clay mb-4">{group.title}</h2>
          <div className="divide-y divide-line border-t border-b border-line">
            {group.items.map((item) => {
              const key = `${group.title}__${item.q}`;
              const isOpen = open === key;
              return (
                <Reveal key={key}>
                  <button
                    onClick={() => setOpen(isOpen ? null : key)}
                    className="w-full flex items-center justify-between py-4 text-left text-[14px] text-ink"
                  >
                    {item.q}
                    <ChevronDown size={16} className={`shrink-0 ml-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && <p className="text-[13px] text-muted leading-relaxed pb-4 pr-8">{item.a}</p>}
                </Reveal>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
