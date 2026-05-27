"use client";

import React from "react";
import type { ArtFormTemplate, JuniRecommendation } from "@/types";
import { useDragScroll } from "@/lib/useDragScroll";

interface Props {
  recs: JuniRecommendation[];
  artForms: ArtFormTemplate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RecommendationCards({
  recs,
  artForms,
  selectedId,
  onSelect,
}: Props) {
  const ref = useDragScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="flex gap-2 overflow-x-auto no-scrollbar -mr-5 pr-5 pb-1 select-none"
    >
      {recs.map((r) => {
        const tpl = artForms.find((t) => t.id === r.suggestedTemplateId);
        const isSelected = selectedId === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={`shrink-0 w-[178px] text-left rounded-2xl overflow-hidden transition active:scale-[0.99] ${
              isSelected
                ? "bg-juni text-white shadow-card ring-2 ring-juni"
                : "bg-white text-ink-900 shadow-card"
            }`}
          >
            <div
              className={`relative h-20 bg-gradient-to-br ${
                tpl?.placeholderGradient ?? "from-juni-soft to-paper-warm"
              }`}
            >
              <div className="absolute inset-0 juni-grain opacity-50" />
              <div
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full ${
                  r.artform === "movie"
                    ? "bg-ink-900/75 text-white"
                    : "bg-white/85 text-ink-700"
                }`}
              >
                {r.artform === "movie" ? "Movie" : "GenArt"}
              </div>
            </div>
            <div className="px-2.5 pt-2 pb-2.5">
              <div
                className={`text-[13px] font-semibold leading-tight line-clamp-1 ${
                  isSelected ? "text-white" : "text-ink-900"
                }`}
              >
                {r.title}
              </div>
              <div
                className={`mt-1 text-[10.5px] leading-snug line-clamp-2 ${
                  isSelected ? "text-white/85" : "text-ink-500"
                }`}
              >
                {r.why}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
