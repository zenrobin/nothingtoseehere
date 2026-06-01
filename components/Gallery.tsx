"use client";

import React, { useState } from "react";
import type { ExistingArt, GenerationJob } from "@/types";
import { useAppStore } from "@/lib/store";
import { placeholderStyle } from "@/lib/placeholder";

interface Props {
  onClose: () => void;
  onStartCreate: () => void;
}

export function Gallery({ onClose, onStartCreate }: Props) {
  const settings = useAppStore((s) => s.settings);
  const jobs = useAppStore((s) => s.jobs);
  const [picking, setPicking] = useState(false);

  const completed = jobs.filter((j) => j.status === "complete");

  const tiles: Array<
    | { kind: "art"; art: ExistingArt }
    | { kind: "job"; job: GenerationJob }
  > = [
    ...completed.map((j) => ({ kind: "job" as const, job: j })),
    ...settings.existingArt.map((a) => ({ kind: "art" as const, art: a })),
  ];

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
        <div className="w-9 h-9" />
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
          onClick={() => setPicking(true)}
          className="flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full bg-juni text-white shadow-card active:scale-[0.98]"
        >
          <span className="text-[14px] font-semibold">Create</span>
          <span className="w-6 h-6 rounded-full bg-white/20 grid place-items-center text-[15px] leading-none">
            +
          </span>
        </button>
      </div>

      {picking && (
        <div className="absolute inset-0 z-40 flex flex-col">
          <button
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setPicking(false)}
            aria-label="Close"
          />
          <div className="mt-auto relative bg-paper-cream rounded-t-3xl shadow-sheet p-5 animate-slide-up">
            <div className="flex justify-center pb-3">
              <div className="w-10 h-1 rounded-full bg-ink-100" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-juni text-white grid place-items-center text-[13px] font-bold">
                J
              </div>
              <div>
                <div className="text-[14px] font-semibold text-ink-900">
                  What should we start from?
                </div>
                <div className="text-[11px] text-ink-500">
                  Juni works best from a memory
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Use this art as inspiration", hint: "Build off a piece you already have" },
                { label: "Choose a memory", hint: "Pick a memory to start from" },
                { label: "Choose photos", hint: "Start from selected photos" },
                { label: "Start with an idea", hint: "Describe what you want — Juni will work backward" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setPicking(false);
                    onStartCreate();
                  }}
                  className="w-full text-left rounded-2xl bg-white shadow-card px-4 py-3 flex items-center justify-between active:scale-[0.99]"
                >
                  <div>
                    <div className="text-[13px] font-semibold text-ink-900">
                      {opt.label}
                    </div>
                    <div className="text-[11px] text-ink-500 mt-0.5">
                      {opt.hint}
                    </div>
                  </div>
                  <span className="text-ink-300">›</span>
                </button>
              ))}
            </div>
            <div className="h-3" />
          </div>
        </div>
      )}
    </div>
  );
}
