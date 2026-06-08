"use client";

import React from "react";
import type { ArtFormTemplate } from "@/types";
import { useDragScroll } from "@/lib/useDragScroll";

interface Props {
  templates: ArtFormTemplate[];
  highlightedId?: string | null;
  onSelect?: (id: string) => void;
}

export function ArtFormCarousel({ templates, highlightedId, onSelect }: Props) {
  const ref = useDragScroll<HTMLDivElement>();
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 px-5">
        <h3 className="text-[12px] uppercase tracking-widest text-ink-500 font-semibold">
          ArtForms
        </h3>
        <button className="text-[11px] text-juni font-medium">
          See all
        </button>
      </div>
      <div
        ref={ref}
        className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 pb-1 select-none"
      >
        {templates.map((t) => {
          const isHi = highlightedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect?.(t.id)}
              className={`shrink-0 w-36 text-left rounded-2xl overflow-hidden bg-white border transition ${
                isHi
                  ? "border-juni shadow-card"
                  : "border-transparent shadow-card"
              }`}
            >
              <div
                className={`h-20 bg-gradient-to-br ${t.placeholderGradient} relative`}
              >
                <div className="absolute inset-0 juni-grain opacity-50" />
                {isHi && (
                  <div className="absolute top-1.5 right-1.5 text-[9px] uppercase tracking-widest font-semibold text-white bg-juni px-1.5 py-0.5 rounded-full">
                    Suggested
                  </div>
                )}
              </div>
              <div className="px-2.5 py-2">
                <div className="text-[12px] font-semibold text-ink-900 truncate">
                  {t.name}
                </div>
                <div className="text-[10px] text-ink-500 line-clamp-2 leading-snug mt-0.5">
                  {t.style}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
