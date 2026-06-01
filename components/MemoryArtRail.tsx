"use client";

import React from "react";
import type { ExistingArt, GenerationJob } from "@/types";
import { useDragScroll } from "@/lib/useDragScroll";
import { placeholderStyle, placeholderTintStyle } from "@/lib/placeholder";

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
            imageUrl={completedJob.imageUrl}
            isNew
            onClick={() => onResultTap(completedJob)}
          />
        )}
        {art.map((a) => (
          <ArtCard key={a.id} art={a} onClick={() => onResultTap(artToJob(a))} />
        ))}
      </div>
    </div>
  );
}

function ArtCard({ art, onClick }: { art: ExistingArt; onClick?: () => void }) {
  const isMovie = art.kind === "movie";
  return (
    <button onClick={onClick} className="shrink-0 w-32 text-left active:scale-[0.99] transition">
      <div
        className="relative h-40 w-32 rounded-2xl shadow-card overflow-hidden"
        style={placeholderStyle(art.kind)}
      >
        {art.imageUrl && (
          <>
            <img
              src={art.imageUrl}
              alt={art.title}
              className="absolute inset-0 w-full h-full object-cover animate-fade-in animate-duration-300"
            />
            <div
              className="absolute inset-0 opacity-40 mix-blend-multiply"
              style={placeholderTintStyle(art.kind)}
            />
          </>
        )}
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
    </button>
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
  imageUrl,
  isNew,
  onClick,
}: {
  title: string;
  gradient?: string;
  imageUrl?: string;
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
        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover animate-fade-in animate-duration-300"
            />
            <div
              className="absolute inset-0 opacity-40 mix-blend-multiply"
              style={placeholderTintStyle(kind as any)}
            />
          </>
        )}
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

function artToJob(art: ExistingArt): GenerationJob {
  const isMovie = art.kind === "movie";
  return {
    id: art.id.startsWith("art-from-") ? art.id.slice("art-from-".length) : art.id,
    memoryId: art.memoryId,
    status: "complete",
    startedAt: Date.now(),
    imageUrl: art.imageUrl,
    brief: {
      artform: isMovie ? "movie" : "genArt",
      sourceMemoryId: art.memoryId,
      conceptId: "",
      conceptTitle: art.title,
      templateId: null,
      templateName: null,
      tone: "quiet and personal",
      keyDetails: [],
      differentiator: "made by Juni",
      summary: art.title,
    },
    result: {
      title: art.title,
      explanation: isMovie 
        ? `I made this movie feel quiet and personal, so it lingers on the everyday details instead of trying to summarize the whole day.`
        : `I made this feel quiet and personal, so it goes somewhere your other art doesn't already cover.`,
      thumbGradient: art.thumbColor,
      kind: art.kind,
    }
  };
}
