"use client";

import React from "react";
import type { ArtFormTemplate, JuniRecommendation } from "@/types";
import { useDragScroll } from "@/lib/useDragScroll";
import { placeholderStyle, placeholderTintStyle } from "@/lib/placeholder";

interface Props {
  recs: JuniRecommendation[];
  artForms: ArtFormTemplate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Optional cover photo (user's uploaded image) used as a subtle backdrop. */
  coverPhotoDataUrl?: string | null;
  onMoreIdeas?: () => void;
}

export function RecommendationCards({
  recs,
  artForms,
  selectedId,
  onSelect,
  coverPhotoDataUrl,
  onMoreIdeas,
}: Props) {
  const ref = useDragScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="flex gap-2 overflow-x-auto no-scrollbar -ml-4 pl-[54px] -mr-4 pr-4 pb-1 select-none"
    >
      {recs.map((r) => {
        const isSelected = selectedId === r.id;
        const isMovie = r.artform === "movie";
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
            <CardThumb
              isMovie={isMovie}
              coverPhotoDataUrl={coverPhotoDataUrl}
            />
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
      {onMoreIdeas && (
        <button
          onClick={onMoreIdeas}
          className="shrink-0 w-[140px] h-[132px] text-center rounded-2xl border-2 border-dashed border-ink-100 bg-white hover:bg-ink-50/40 text-ink-900 shadow-card flex flex-col items-center justify-center gap-2 transition active:scale-[0.98] select-none"
        >
          <div className="w-9 h-9 rounded-full bg-juni-soft text-juni flex items-center justify-center font-bold text-[18px]">
            +
          </div>
          <div>
            <div className="text-[12px] font-semibold text-ink-800">More Ideas</div>
            <div className="text-[9.5px] text-ink-400 mt-0.5">Explore more</div>
          </div>
        </button>
      )}
    </div>
  );
}

function CardThumb({
  isMovie,
  coverPhotoDataUrl,
}: {
  isMovie: boolean;
  coverPhotoDataUrl?: string | null;
}) {
  const kind = isMovie ? "movie" : "genArt";
  return (
    <div className="relative h-20 overflow-hidden">
      {coverPhotoDataUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverPhotoDataUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(2px)" }}
          />
          <div className="absolute inset-0" style={placeholderTintStyle(kind)} />
        </>
      ) : (
        <div className="absolute inset-0" style={placeholderStyle(kind)} />
      )}
      <div className="absolute inset-0 juni-grain opacity-40" />
      <div
        className={`absolute top-1.5 left-1.5 text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full ${
          isMovie ? "bg-white/90 text-slate-900" : "bg-white/90 text-orange-950"
        }`}
      >
        {isMovie ? "Movie" : "GenArt"}
      </div>
      {isMovie && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="w-7 h-7 rounded-full bg-white/85 grid place-items-center text-slate-900 text-[12px] leading-none">
            ▶
          </div>
        </div>
      )}
    </div>
  );
}
