"use client";

import React from "react";
import type { ExistingArt, GenerationJob } from "@/types";
import { useDragScroll } from "@/lib/useDragScroll";
import { placeholderStyle } from "@/lib/placeholder";

interface Props {
  art: ExistingArt[];
  pendingJob: GenerationJob | null;
  completedJob: GenerationJob | null;
  onResultTap: (job: GenerationJob) => void;
}

export function MemoryArtRail({ art, pendingJob, completedJob, onResultTap }: Props) {
  const ref = useDragScroll<HTMLDivElement>();
  return (
    <div className="px-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
          Memory Art
        </h2>
        <span className="text-[11px] text-ink-500">
          {art.length + (pendingJob ? 1 : 0) + (completedJob ? 1 : 0)} pieces
        </span>
      </div>
      <div
        ref={ref}
        className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1 select-none"
      >
        {pendingJob && pendingJob.status === "pending" && (
          <PendingCard brief={pendingJob.brief.summary} />
        )}
        {completedJob && completedJob.result && (
          <ResultCard
            title={completedJob.result.title}
            kind={completedJob.result.kind}
            gradient={completedJob.result.thumbGradient}
            isNew
            onClick={() => onResultTap(completedJob)}
          />
        )}
        {art.map((a) => (
          <ArtCard key={a.id} art={a} />
        ))}
      </div>
    </div>
  );
}

function ArtCard({ art }: { art: ExistingArt }) {
  const isMovie = art.kind === "movie";
  return (
    <div className="shrink-0 w-32">
      <div
        className="relative h-40 w-32 rounded-2xl shadow-card overflow-hidden"
        style={placeholderStyle(art.kind)}
      >
        <div className="absolute inset-0 juni-grain opacity-40" />
        <div className="absolute top-2 left-2">
          <div
            className={`text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full ${
              isMovie ? "bg-white/90 text-slate-900" : "bg-white/90 text-orange-950"
            }`}
          >
            {isMovie ? "Movie" : "GenArt"}
          </div>
        </div>
        {isMovie && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-9 h-9 rounded-full bg-white/85 grid place-items-center text-slate-900 text-[14px] leading-none">
              ▶
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <div className="text-[13px] font-semibold text-ink-900 truncate">
          {art.title}
        </div>
        {art.subtitle && (
          <div className="text-[11px] text-ink-500 truncate">{art.subtitle}</div>
        )}
      </div>
    </div>
  );
}

function PendingCard({ brief }: { brief: string }) {
  return (
    <div className="shrink-0 w-32">
      <div className="relative h-40 w-32 rounded-2xl overflow-hidden bg-gradient-to-br from-juni-soft via-paper-cream to-juni-mint/40 shadow-card">
        <div className="absolute inset-0 shimmer" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
          <div className="w-7 h-7 rounded-full bg-juni/90 grid place-items-center text-white text-[11px] font-bold animate-pulse-soft">
            J
          </div>
          <div className="mt-2 text-[11px] font-medium text-ink-700">
            Creating your art
          </div>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <div className="text-[12px] font-semibold text-juni-ink truncate">
          Creating…
        </div>
        <div className="text-[10px] text-ink-500 line-clamp-2">{brief}</div>
      </div>
    </div>
  );
}

function ResultCard({
  title,
  kind,
  isNew,
  onClick,
}: {
  title: string;
  gradient?: string;
  kind: string;
  isNew?: boolean;
  onClick?: () => void;
}) {
  const isMovie = kind === "movie";
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-32 text-left animate-fade-in"
    >
      <div
        className="relative h-40 w-32 rounded-2xl shadow-card overflow-hidden"
        style={placeholderStyle(kind as any)}
      >
        <div className="absolute inset-0 juni-grain opacity-40" />
        {isNew && (
          <div className="absolute top-2 right-2 bg-juni text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            New
          </div>
        )}
        <div className="absolute top-2 left-2">
          <div
            className={`text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full ${
              isMovie ? "bg-white/90 text-slate-900" : "bg-white/90 text-orange-950"
            }`}
          >
            {isMovie ? "Movie" : "GenArt"}
          </div>
        </div>
        {isMovie && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-9 h-9 rounded-full bg-white/85 grid place-items-center text-slate-900 text-[14px] leading-none">
              ▶
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <div className="text-[13px] font-semibold text-ink-900 truncate">
          {title}
        </div>
        <div className="text-[11px] text-juni truncate">Made by Juni</div>
      </div>
    </button>
  );
}
