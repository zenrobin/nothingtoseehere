"use client";

import React from "react";
import type { ArtFormTemplate, JuniRecommendation } from "@/types";

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
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
      {recs.map((r) => {
        const tpl = artForms.find((t) => t.id === r.suggestedTemplateId);
        const isSelected = selectedId === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={`shrink-0 w-[260px] text-left rounded-2xl p-3 transition active:scale-[0.99] ${
              isSelected
                ? "bg-juni text-white shadow-card"
                : "bg-white text-ink-900 shadow-card"
            }`}
          >
            <div
              className={`relative h-32 rounded-xl overflow-hidden bg-gradient-to-br ${
                tpl?.placeholderGradient ?? "from-juni-soft to-paper-warm"
              }`}
            >
              <div className="absolute inset-0 juni-grain opacity-50" />
              <div className="absolute top-2 left-2 text-[10px] uppercase tracking-widest font-semibold text-ink-700/80 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full">
                {r.artform === "movie" ? "Movie" : "GenArt"}
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-[15px] font-semibold ${
                  isSelected ? "text-white" : "text-ink-900"
                }`}
              >
                {r.title}
              </div>
              <div
                className={`mt-1 text-[12px] leading-snug ${
                  isSelected ? "text-white/85" : "text-ink-700"
                }`}
              >
                {r.description}
              </div>
              <div
                className={`mt-2 text-[11px] leading-snug italic ${
                  isSelected ? "text-white/75" : "text-ink-500"
                }`}
              >
                Juni: {r.why}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
