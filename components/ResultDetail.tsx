"use client";

import React from "react";
import type { GenerationJob } from "@/types";
import { TypewriterText } from "./TypewriterText";
import { placeholderStyle } from "@/lib/placeholder";

interface Props {
  job: GenerationJob;
  onClose: () => void;
  onMakeAnother: () => void;
  onMakeMore: () => void;
  onTryMovie: () => void;
}

export function ResultDetail({
  job,
  onClose,
  onMakeAnother,
  onMakeMore,
  onTryMovie,
}: Props) {
  if (!job.result) return null;
  const { result } = job;
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 pt-4 pb-4">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-ink-100/50 hover:bg-ink-100/80 text-ink-900 flex items-center justify-center transition active:scale-95"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="text-[11px] uppercase tracking-widest text-ink-500">
          Your art
        </div>
        <div className="w-8 h-8" />
      </div>
      <div className="flex-1 scroll-area px-5 pt-0 pb-32">
        <div
          className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card"
          style={placeholderStyle(result.kind)}
        >
          {job.imageUrl && (
            <img
              src={job.imageUrl}
              alt={result.title}
              className="absolute inset-0 w-full h-full object-cover animate-fade-in animate-duration-300"
            />
          )}
          <div className="absolute inset-0 juni-grain" />
          <div className="absolute top-3 left-3 bg-white/80 backdrop-blur text-[10px] uppercase tracking-widest font-semibold text-ink-700 px-2 py-1 rounded-full">
            {result.kind === "movie" ? "Movie" : "GenArt"}
          </div>
          {result.kind === "movie" && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-14 h-14 rounded-full bg-black/30 grid place-items-center text-white text-[20px]">
                ▶
              </div>
            </div>
          )}
        </div>
        <h2 className="font-serif text-[26px] mt-5 text-ink-900 tracking-tight">
          {result.title}
        </h2>
        <div className="text-[11px] text-juni mt-1">Made by Juni</div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-juni text-white grid place-items-center text-[10px] font-bold">
              J
            </div>
            <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold">
              Why this works
            </div>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
            <TypewriterText text={result.explanation} speedMs={10} startDelayMs={300} />
          </p>
        </div>

        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold mb-2">
            Actions
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ActionBtn label="View" icon="◇" onClick={() => {}} />
            <ActionBtn label="Save" icon="♡" onClick={() => {}} />
            <ActionBtn label="Share" icon="↗" onClick={() => {}} />
            <ActionBtn label="Make another" icon="+" onClick={onMakeAnother} />
            <ActionBtn label="Make it more..." icon="✺" onClick={onMakeMore} />
            <ActionBtn
              label="Try Movie"
              icon="▶"
              onClick={onTryMovie}
              accent
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  icon,
  onClick,
  accent,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl px-3.5 py-3 shadow-card active:scale-[0.99] ${
        accent ? "bg-juni text-white" : "bg-white text-ink-900"
      }`}
    >
      <span className="text-[14px]">{icon}</span>
      <span className="text-[13px] font-semibold">{label}</span>
    </button>
  );
}
