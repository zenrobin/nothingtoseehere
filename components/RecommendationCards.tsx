"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
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

export function getCardImage(
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
  const containerRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({
    isDown: false,
    startX: 0,
    startScroll: 0,
    moved: false,
    lastDragEndAt: 0,
  });

  // Synchronize index when selectedId is set (for history state)
  const selectedIndex = useMemo(() => {
    if (!selectedId) return 0;
    const idx = recs.findIndex((r) => r.id === selectedId);
    return idx !== -1 ? idx : 0;
  }, [recs, selectedId]);

  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  const snapToCard = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.children;
    const card = cards[index] as HTMLElement;
    if (card) {
      container.scrollTo({
        left: card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    if (selectedId) {
      setActiveIndex(selectedIndex);
      const container = containerRef.current;
      if (container) {
        const cards = container.children;
        const card = cards[selectedIndex] as HTMLElement;
        if (card) {
          setTimeout(() => {
            container.scrollTo({
              left: card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2,
              behavior: "smooth",
            });
          }, 80);
        }
      }
    }
  }, [selectedId, selectedIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (container && activeIndex > 0) {
      const cards = container.children;
      const card = cards[activeIndex] as HTMLElement;
      if (card) {
        const timer = setTimeout(() => {
          container.scrollTo({
            left: card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2,
            behavior: "smooth",
          });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectedId) return; // History state is locked
    if (e.pointerType === "touch") return; // Let touch scrolls snap naturally
    if (e.button !== 0) return; // Primary button only

    const container = containerRef.current;
    if (!container) return;

    dragInfo.current.isDown = true;
    dragInfo.current.startX = e.clientX;
    dragInfo.current.startScroll = container.scrollLeft;
    dragInfo.current.moved = false;

    container.style.cursor = "grabbing";
    container.style.scrollSnapType = "none"; // Disable snap fighting during dragging
    container.style.scrollBehavior = "auto";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.current.isDown) return;
    const container = containerRef.current;
    if (!container) return;

    const dx = e.clientX - dragInfo.current.startX;
    if (Math.abs(dx) > 4) {
      dragInfo.current.moved = true;
      container.scrollLeft = dragInfo.current.startScroll - dx;
    }
  };

  const handlePointerUpOrLeave = () => {
    if (!dragInfo.current.isDown) return;
    const container = containerRef.current;
    if (!container) return;

    dragInfo.current.isDown = false;
    container.style.cursor = "grab";
    container.style.scrollSnapType = "x mandatory";
    container.style.scrollBehavior = "smooth";

    // Snaps to the closest card relative to the center
    const center = container.scrollLeft + container.offsetWidth / 2;
    const cards = container.children;

    let closestIndex = activeIndex;
    let minDistance = Infinity;

    const totalCardsCount = recs.length + (onMoreIdeas && !selectedId ? 1 : 0);
    for (let i = 0; i < totalCardsCount; i++) {
      const card = cards[i] as HTMLElement;
      if (!card) continue;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    snapToCard(closestIndex);

    if (dragInfo.current.moved) {
      dragInfo.current.lastDragEndAt = Date.now();
    }
  };

  const handleCardClick = (index: number, e: React.MouseEvent) => {
    if (selectedId) return;
    // Prevent selection if click is fired immediately after dragging
    if (Date.now() - dragInfo.current.lastDragEndAt < 100) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (activeIndex === index) {
      if (index === recs.length && onMoreIdeas) {
        onMoreIdeas();
      } else if (recs[index]) {
        onSelect(recs[index].id);
      }
    } else {
      snapToCard(index);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (dragInfo.current.isDown) return; // Ignore scroll updates during custom dragging
    const container = e.currentTarget;
    const center = container.scrollLeft + container.offsetWidth / 2;
    const cards = container.children;

    let closestIndex = activeIndex;
    let minDistance = Infinity;

    const totalCardsCount = recs.length + (onMoreIdeas && !selectedId ? 1 : 0);
    for (let i = 0; i < totalCardsCount; i++) {
      const card = cards[i] as HTMLElement;
      if (!card) continue;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== activeIndex && closestIndex < totalCardsCount) {
      setActiveIndex(closestIndex);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* 1. Horizontal Carousel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        style={{
          paddingLeft: "calc(50% - 84px)",
          paddingRight: "calc(50% - 84px)",
          cursor: selectedId ? "default" : "grab",
        }}
        className="relative flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-6 pb-8 -mt-6 -mb-8 -ml-4 -mr-4 select-none scroll-smooth touch-pan-y"
      >
        {recs.map((r, i) => {
          const isFocused = activeIndex === i;
          const isMovie = r.artform === "movie";
          const imgSrc = getCardImage(r, coverPhotoDataUrl);

          return (
            <button
              key={r.id}
              onClick={(e) => handleCardClick(i, e)}
              disabled={!!selectedId && selectedId !== r.id}
              className={`snap-center shrink-0 w-[200px] h-[267px] relative rounded-[28px] overflow-hidden transition-all duration-300 select-none ${
                isFocused
                  ? "scale-100 opacity-100 shadow-xl"
                  : "scale-90 opacity-40 shadow-md"
              }`}
            >
              {/* Image filling full card */}
              <img
                src={imgSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35" />
              <div className="absolute inset-0 juni-grain opacity-20" />

              {/* Cinematic movie play button */}
              {isMovie && (
                <div className="absolute inset-0 grid place-items-center">
                  <div
                    className={`rounded-full bg-white/90 grid place-items-center text-slate-900 shadow-md transition-all duration-300 ${
                      isFocused ? "w-11 h-11 text-[13px] shadow-lg" : "w-8 h-8 text-[10px]"
                    }`}
                  >
                    ▶
                  </div>
                </div>
              )}

              {/* Bottom floating capsule tag */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/45 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-[11px] font-semibold tracking-wider flex items-center shadow-md whitespace-nowrap">
                {isMovie ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="mr-1.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Movie</span>
                  </>
                ) : (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>GenArt</span>
                  </>
                )}
              </div>
            </button>
          );
        })}

        {/* More Ideas Button as a matching card style */}
        {onMoreIdeas && !selectedId && (
          <button
            onClick={(e) => handleCardClick(recs.length, e)}
            className={`snap-center shrink-0 w-[200px] h-[267px] text-center rounded-[28px] border-2 border-dashed border-ink-200 bg-white hover:bg-ink-50/40 text-ink-900 flex flex-col items-center justify-center gap-2.5 transition active:scale-[0.98] select-none ${
              activeIndex === recs.length
                ? "scale-100 opacity-100 shadow-xl border-2 border-juni/10"
                : "scale-90 opacity-40 shadow-md"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-juni-soft text-juni flex items-center justify-center font-bold text-[20px] shadow-sm">
              +
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-ink-800">More Ideas</div>
              <div className="text-[10px] text-ink-400 mt-0.5">Explore more</div>
            </div>
          </button>
        )}
      </div>

      {/* 2. Focused card details card underneath */}
      {activeIndex < recs.length && recs[activeIndex] && (
        <div className="relative z-10 mx-auto max-w-[325px] bg-[#F8F7F3] rounded-[24px] p-5 text-center shadow-sm animate-fade-in my-1">
          <h4 className="font-bold text-ink-900 text-[15px] mb-1 leading-tight">
            {recs[activeIndex].title}
          </h4>
          <p className="text-ink-500 text-[12.5px] leading-relaxed mb-3 line-clamp-3">
            {recs[activeIndex].why}
          </p>
          {!selectedId && (
            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
              {recs[activeIndex].artform === "genArt" && (
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-full border border-ink-200 text-ink-600 bg-white/80 backdrop-blur-sm font-semibold text-[13px] hover:bg-ink-50/40 active:scale-[0.98] transition shadow-sm"
                >
                  Swap photo
                </button>
              )}
              <button
                onClick={() => onSelect(recs[activeIndex].id)}
                className="px-6 py-2.5 rounded-full bg-juni text-white font-semibold text-[13px] active:scale-[0.98] transition shadow-sm"
              >
                Choose this direction
              </button>
            </div>
          )}
        </div>
      )}

      {activeIndex === recs.length && onMoreIdeas && (
        <div className="relative z-10 mx-auto max-w-[325px] bg-[#F8F7F3] rounded-[24px] p-5 text-center shadow-sm animate-fade-in my-1">
          <h4 className="font-bold text-ink-900 text-[15px] mb-1 leading-tight">
            Explore More Directions
          </h4>
          <p className="text-ink-500 text-[12.5px] leading-relaxed mb-3">
            Ask Juni to look at your memory from fresh angles and suggest new concepts.
          </p>
          <button
            onClick={onMoreIdeas}
            className="w-full py-2.5 rounded-full bg-juni text-white font-semibold text-[13px] active:scale-[0.98] transition shadow-sm mt-1"
          >
            Load more ideas
          </button>
        </div>
      )}
    </div>
  );
}
