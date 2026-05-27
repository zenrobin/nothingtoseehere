"use client";

import React from "react";
import type { GenerationJob, Memory, PhotoAnalysis, ExistingArt } from "@/types";
import { MemoryArtRail } from "./MemoryArtRail";
import { MemoryMedia } from "./MemoryMedia";

interface Props {
  memory: Memory;
  photoAnalyses: PhotoAnalysis[];
  existingArt: ExistingArt[];
  pendingJob: GenerationJob | null;
  completedJob: GenerationJob | null;
  creationsLeft: number;
  onCreate: () => void;
  onGallery: () => void;
  onSettings: () => void;
  onChangeMemory: () => void;
  onResultTap: (job: GenerationJob) => void;
}

export function MemoryDetail(props: Props) {
  const { memory, photoAnalyses, existingArt, pendingJob, completedJob } = props;

  return (
    <div className="h-full flex flex-col relative bg-paper">
      {/* Top nav */}
      <div className="flex items-center justify-between px-4 pt-2 pb-2">
        <button
          onClick={props.onGallery}
          className="w-9 h-9 rounded-full grid place-items-center text-ink-700 hover:bg-black/5 active:bg-black/10"
          aria-label="Gallery"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="text-[11px] text-ink-500 uppercase tracking-widest">
          Memory
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={props.onChangeMemory}
            className="w-9 h-9 rounded-full grid place-items-center text-ink-700 hover:bg-black/5"
            aria-label="Change memory or photos"
            title="Change memory or photos"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4M12 4l-5 5m5-5l5 5M4 20h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={props.onSettings}
            className="w-9 h-9 rounded-full grid place-items-center text-ink-700 hover:bg-black/5"
            aria-label="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8a4 4 0 100 8 4 4 0 000-8z M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1A2 2 0 113.3 17l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1A2 2 0 117 4.3l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Scroll content */}
      <div className="flex-1 scroll-area pb-32">
        {/* Hero */}
        <div className="px-5 pt-2">
          <div className="text-[11px] uppercase tracking-widest text-juni font-medium">
            {memory.categories[0]?.main ?? "Memory"}
            {memory.timeline[0]?.location
              ? ` · ${memory.timeline[0].location}`
              : ""}
          </div>
          <h1 className="mt-1 font-serif text-[34px] leading-[1.05] tracking-tight text-ink-900">
            {memory.snappy_title}
          </h1>
          <div className="mt-1 text-[13px] text-ink-500">
            {memory.descriptive_title}
          </div>
        </div>

        {/* Hero image */}
        <div className="px-5 mt-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card bg-paper-warm">
            <HeroVisual memory={memory} photo={photoAnalyses[0]} />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/55 via-black/20 to-transparent">
              <p className="text-white text-[13px] leading-snug">
                {memory.editorial_intro}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="px-5 mt-5">
          <p className="text-[13px] leading-relaxed text-ink-700">
            {memory.memory_summary}
          </p>
        </div>

        {/* Existing art rail */}
        <div className="mt-7">
          <MemoryArtRail
            art={existingArt}
            pendingJob={pendingJob}
            completedJob={completedJob}
            onResultTap={props.onResultTap}
          />
        </div>

        {/* Memory media */}
        <div className="mt-7">
          <MemoryMedia photos={photoAnalyses} />
        </div>

        {/* Footer space */}
        <div className="h-24" />
      </div>

      {/* Create CTA */}
      <div className="absolute bottom-5 right-5 z-20">
        <button
          onClick={props.onCreate}
          className="group flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full bg-juni text-white shadow-card shadow-juni/30 active:scale-[0.98] transition"
        >
          <span className="text-[14px] font-semibold">Create Artwork</span>
          <span className="w-6 h-6 rounded-full bg-white/20 grid place-items-center text-[15px] leading-none">
            +
          </span>
        </button>
        <div className="text-[10px] text-ink-500 mt-1 text-right pr-2">
          {props.creationsLeft} creations left
        </div>
      </div>
    </div>
  );
}

function HeroVisual({
  memory,
  photo,
}: {
  memory: Memory;
  photo?: PhotoAnalysis;
}) {
  if (photo?.imageDataUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={photo.imageDataUrl}
        alt={memory.snappy_title}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  return (
    <div
      className="absolute inset-0 juni-grain"
      style={{
        backgroundImage:
          "linear-gradient(160deg, #E8EAEF 0%, #C7CDD9 45%, #8C95A6 100%)",
      }}
    >
      {/* Mock house silhouette */}
      <svg
        viewBox="0 0 200 250"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D8DEE8" />
            <stop offset="1" stopColor="#A8B0BF" />
          </linearGradient>
        </defs>
        <rect width="200" height="160" fill="url(#sky)" />
        <rect x="40" y="70" width="120" height="120" fill="#EFEDE8" />
        <rect x="35" y="68" width="130" height="8" fill="#D9D6CF" />
        <rect x="80" y="110" width="40" height="80" fill="#FFFFFF" />
        <circle cx="113" cy="150" r="1.6" fill="#BCA15B" />
        <rect x="62" y="118" width="14" height="6" fill="#B8B3A8" />
        <text
          x="68"
          y="123"
          fontSize="5"
          fontWeight="700"
          fill="#2A2C33"
          fontFamily="ui-sans-serif"
        >
          TWENTY 4
        </text>
        {/* Steps */}
        <rect x="78" y="190" width="44" height="6" fill="#CDCFD2" />
        <rect x="76" y="196" width="48" height="6" fill="#C2C4C8" />
        <rect x="74" y="202" width="52" height="6" fill="#B6B8BD" />
        <rect x="72" y="208" width="56" height="6" fill="#ABADB2" />
        <rect x="70" y="214" width="60" height="6" fill="#9FA1A6" />
        {/* Bike */}
        <circle cx="138" cy="200" r="8" fill="none" stroke="#1A1B20" strokeWidth="2"/>
        <circle cx="155" cy="200" r="8" fill="none" stroke="#1A1B20" strokeWidth="2"/>
        <path d="M138 200 L150 184 L155 200 M142 186 L150 184" stroke="#1A1B20" strokeWidth="1.8" fill="none"/>
        {/* Box */}
        <rect x="98" y="184" width="14" height="9" fill="#A4825A" />
        <rect x="98" y="184" width="14" height="2" fill="#8F6C46" />
        {/* Shrubs */}
        <ellipse cx="60" cy="218" rx="14" ry="7" fill="#5D7A5B" />
        <ellipse cx="160" cy="218" rx="16" ry="8" fill="#5D7A5B" />
        <rect width="200" height="20" y="230" fill="#7C8576" />
      </svg>
      <div className="absolute top-3 right-3 bg-white/70 backdrop-blur text-[9px] uppercase tracking-widest text-ink-700 px-2 py-1 rounded-full">
        placeholder
      </div>
    </div>
  );
}
