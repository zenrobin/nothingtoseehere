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

function getCardImage(
  rec: JuniRecommendation,
  userPhoto?: string | null
): string {
  if (userPhoto && (userPhoto.startsWith("data:") || userPhoto.startsWith("blob:") || !userPhoto.includes("unsplash.com"))) {
    return userPhoto;
  }

  // Match by Stable Recommendation IDs to guarantee completely distinct, relevant, high-resolution imagery
  if (rec.id === "rec-quiet-house-portrait") {
    // Pristine architectural house portrait (facade)
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&h=300&q=80";
  }
  if (rec.id === "rec-everyday-homecoming") {
    // Cozy entrance porch detail (green steps & bicycle)
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&h=300&q=80";
  }
  if (rec.id === "rec-vintage-address-card" || rec.id === "rec-vintage-address" || rec.title.toLowerCase().includes("twenty")) {
    // Vintage typography / character underlayer
    return "https://images.unsplash.com/photo-1572945281869-8f36c57912cd?auto=format&fit=crop&w=400&h=300&q=80";
  }
  if (rec.id === "rec-editorial-threshold" || rec.title.toLowerCase().includes("wellesley") || rec.title.toLowerCase().includes("afternoon")) {
    // Moody, low-contrast editorial landscape (foggy mountain mist)
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&h=300&q=80";
  }
  if (rec.id === "rec-quiet-homecoming-movie" || rec.artform === "movie") {
    // Cinematic misty path / slow cinematic road opener
    return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&h=300&q=80";
  }

  // Fallback for custom entries: generate a query based on words in title
  const queryWords: string[] = [];
  rec.title.split(" ").forEach((w) => {
    const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (clean && clean.length > 2) queryWords.push(clean);
  });
  const query = queryWords.length > 0 ? queryWords.join(",") : "scenery,landscape";
  return `https://loremflickr.com/400/300/${query}`;
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
            className="shrink-0 w-[178px] text-left rounded-2xl overflow-hidden transition active:scale-[0.99] bg-white text-ink-900 shadow-card"
          >
            <CardThumb
              isMovie={isMovie}
              coverPhotoDataUrl={getCardImage(r, coverPhotoDataUrl)}
            />
            <div className="px-2.5 pt-2 pb-2.5">
              <div className="text-[13px] font-semibold leading-tight line-clamp-1 text-ink-900">
                {r.title}
              </div>
              <div className="mt-1 text-[10.5px] leading-snug line-clamp-2 text-ink-500">
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
  const fallbackUrl = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80`;
  const imgSrc = coverPhotoDataUrl || fallbackUrl;

  return (
    <div className="relative h-20 overflow-hidden bg-ink-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      <div className="absolute inset-0 juni-grain opacity-20" />
      <div
        className={`absolute top-1.5 left-1.5 text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full ${
          isMovie ? "bg-white/95 text-slate-900 shadow-sm" : "bg-white/95 text-orange-950 shadow-sm"
        }`}
      >
        {isMovie ? "Movie" : "GenArt"}
      </div>
      {isMovie && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="w-7 h-7 rounded-full bg-white/90 grid place-items-center text-slate-900 text-[10px] leading-none shadow-md transition active:scale-90">
            ▶
          </div>
        </div>
      )}
    </div>
  );
}
