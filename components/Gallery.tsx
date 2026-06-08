"use client";

import React, { useEffect, useState } from "react";
import type { CreativeBrief, ExistingArt, GenerationJob } from "@/types";
import { useAppStore } from "@/lib/store";
import { placeholderStyle } from "@/lib/placeholder";
import { GalleryStartSheet } from "./GalleryStartSheet";
import { PayScreen } from "./PayScreen";

interface Props {
  onClose: () => void;
  /** Called when the user picks the currently-loaded memory from the
   *  "Start with a Memory" sub-flow inside the new gallery start sheet. */
  onSelectCurrentMemory: () => void;
  /** Called when a gallery sub-flow (Photos / Idea) produces a brief
   *  that should kick off a generation job. */
  onConfirmBrief: (brief: CreativeBrief) => void;
}

export function Gallery({
  onClose,
  onSelectCurrentMemory,
  onConfirmBrief,
}: Props) {
  const settings = useAppStore((s) => s.settings);
  const jobs = useAppStore((s) => s.jobs);
  const [picking, setPicking] = useState(false);
  const [paying, setPaying] = useState(false);

  const completed = jobs.filter((j) => j.status === "complete");
  const creationsLeft = settings.generation.creationsLeft;
  const outOfCreations = creationsLeft <= 0;

  // Auto-show paywall if the user lands here with zero creations left.
  useEffect(() => {
    if (outOfCreations) setPaying(true);
  }, [outOfCreations]);

  const tiles: Array<
    | { kind: "art"; art: ExistingArt }
    | { kind: "job"; job: GenerationJob }
  > = [
    ...completed.map((j) => ({ kind: "job" as const, job: j })),
    ...settings.existingArt.map((a) => ({ kind: "art" as const, art: a })),
  ];

  function startCreate() {
    if (outOfCreations) {
      setPaying(true);
      return;
    }
    setPicking(true);
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full grid place-items-center text-ink-700 hover:bg-black/5"
          aria-label="Back"
        >
          ←
        </button>
        <div className="text-[11px] uppercase tracking-widest text-ink-500">
          Memory Art Gallery
        </div>
        <button
          onClick={() => setPaying(true)}
          className="text-[10px] font-mono font-semibold text-juni-ink bg-juni-soft px-2.5 py-1 rounded-full active:scale-[0.97] transition"
          title="Tap to upgrade"
        >
          {creationsLeft} left
        </button>
      </div>
      <div className="px-5 mt-1">
        <h1 className="font-serif text-[28px] tracking-tight text-ink-900">
          Your Memory Art
        </h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Art across all your memories
        </p>
      </div>
      <div className="flex-1 scroll-area px-5 mt-4 pb-28">
        <div className="grid grid-cols-2 gap-3">
          {tiles.length === 0 && (
            <div className="col-span-2 text-center text-[12px] text-ink-500 py-12">
              No art yet. Tap Create to make your first.
            </div>
          )}
          {tiles.map((t, i) => {
            if (t.kind === "art") {
              return (
                <div
                  key={`a-${t.art.id}-${i}`}
                  className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card"
                  style={placeholderStyle(t.art.kind)}
                >
                  <div className="absolute inset-0 juni-grain opacity-50" />
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <div className="text-[9px] text-white/85 uppercase tracking-widest font-medium">
                      {t.art.kind === "movie" ? "Movie" : "GenArt"}
                    </div>
                    <div className="text-[13px] font-semibold text-white leading-tight mt-0.5">
                      {t.art.title}
                    </div>
                  </div>
                </div>
              );
            }
            const r = t.job.result!;
            return (
              <div
                key={`j-${t.job.id}-${i}`}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card"
                style={placeholderStyle(r.kind)}
              >
                <div className="absolute inset-0 juni-grain opacity-50" />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                <div className="absolute top-2 left-2 bg-juni text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  New
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <div className="text-[9px] text-white/85 uppercase tracking-widest font-medium">
                    {r.kind === "movie" ? "Movie" : "GenArt"}
                  </div>
                  <div className="text-[13px] font-semibold text-white leading-tight mt-0.5">
                    {r.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating create */}
      <div className="absolute bottom-5 right-5 z-20">
        <button
          onClick={startCreate}
          className="flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full bg-juni text-white shadow-card active:scale-[0.98]"
        >
          <span className="text-[14px] font-semibold">Create</span>
          <span className="w-6 h-6 rounded-full bg-white/20 grid place-items-center text-[15px] leading-none">
            +
          </span>
        </button>
      </div>

      {picking && (
        <GalleryStartSheet
          onClose={() => setPicking(false)}
          onSelectCurrentMemory={() => {
            setPicking(false);
            onSelectCurrentMemory();
          }}
          onConfirmBrief={(brief) => {
            setPicking(false);
            onConfirmBrief(brief);
          }}
        />
      )}

      <PayScreen
        open={paying}
        dismissible={!outOfCreations}
        onUnlock={() => setPaying(false)}
        onMaybeLater={() => setPaying(false)}
      />
    </div>
  );
}
