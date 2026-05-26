"use client";

import React from "react";
import type { ExistingArt, GenerationJob } from "@/types";

interface Props {
  art: ExistingArt[];
  pendingJob: GenerationJob | null;
  completedJob: GenerationJob | null;
  onResultTap: (job: GenerationJob) => void;
}

export function MemoryArtRail({ art, pendingJob, completedJob, onResultTap }: Props) {
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
      <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
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
  return (
    <div className="shrink-0 w-32">
      <div
        className={`relative h-40 w-32 rounded-2xl shadow-card overflow-hidden bg-gradient-to-br ${art.thumbColor}`}
      >
        <div className="absolute inset-0 juni-grain opacity-50" />
        <div className="absolute bottom-2 left-2 right-2">
          {art.kind === "movie" && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur rounded-full px-2 py-0.5 w-fit">
              <span>▶</span>
              <span>Movie</span>
            </div>
          )}
          {art.kind === "genArt" && (
            <div className="text-[10px] font-medium text-ink-700 bg-white/70 backdrop-blur rounded-full px-2 py-0.5 w-fit">
              GenArt
            </div>
          )}
        </div>
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
          <div className="w-7 h-7 rounded-full bg-juni-DEFAULT/90 grid place-items-center text-white text-[11px] font-bold animate-pulse-soft">
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
  gradient,
  kind,
  isNew,
  onClick,
}: {
  title: string;
  gradient: string;
  kind: string;
  isNew?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-32 text-left animate-fade-in"
    >
      <div
        className={`relative h-40 w-32 rounded-2xl shadow-card overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        <div className="absolute inset-0 juni-grain opacity-60" />
        {isNew && (
          <div className="absolute top-2 left-2 bg-juni-DEFAULT text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            New
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-[10px] font-medium text-ink-700 bg-white/80 backdrop-blur rounded-full px-2 py-0.5 w-fit">
            {kind === "movie" ? "Movie" : "GenArt"}
          </div>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <div className="text-[13px] font-semibold text-ink-900 truncate">
          {title}
        </div>
        <div className="text-[11px] text-juni-DEFAULT truncate">Made by Juni</div>
      </div>
    </button>
  );
}
