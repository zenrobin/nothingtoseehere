"use client";

import React, { useState } from "react";
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
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const hasOverflow = memory.memory_summary.length > 180;

  return (
    <div className="h-full flex flex-col relative bg-white">
      {/* Scroll content */}
      <div className="flex-1 scroll-area pb-32">
        {/* Hero cover image (pinned to top, full width) */}
        <div className="relative w-full aspect-[4/5] bg-paper-warm overflow-hidden select-none">
          <HeroVisual memory={memory} photo={photoAnalyses[0]} />

          {/* Floating Actions Over the Image (42x42 circles with 40% black transparent blur backdrop) */}
          <div className="absolute top-4 right-4 flex items-center gap-2.5 z-10">
            {/* Upload Button */}
            <button
              onClick={props.onChangeMemory}
              className="w-[42px] h-[42px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 active:scale-95 transition"
              aria-label="Change memory or photos"
              title="Change memory or photos"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V4M12 4l-5 5m5-5l5 5M4 20h16"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* Settings Button */}
            <button
              onClick={props.onSettings}
              className="w-[42px] h-[42px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 active:scale-95 transition"
              aria-label="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8a4 4 0 100 8 4 4 0 000-8z M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1A2 2 0 113.3 17l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1A2 2 0 117 4.3l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Premium Bottom Darkening Gradient Overlay with White Text */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end pt-28 select-none">
            <div className="text-[11px] uppercase tracking-widest text-white/75 font-medium">
              {memory.categories[0]?.main ?? "Memory"}
              {memory.timeline[0]?.location
                ? ` · ${memory.timeline[0].location}`
                : ""}
            </div>
            <h1 className="mt-1 font-serif text-[34px] leading-[1.05] tracking-tight text-white">
              {memory.snappy_title}
            </h1>
            <div className="mt-1.5 text-[13px] text-white/80">
              {memory.descriptive_title}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="px-5 mt-5">
          <p className="text-[13px] leading-relaxed text-ink-700">
            {summaryExpanded ? (
              <>
                {memory.memory_summary}
                {hasOverflow && (
                  <button
                    onClick={() => setSummaryExpanded(false)}
                    className="text-[12px] font-semibold text-juni ml-1.5 hover:underline inline-block select-none"
                  >
                    Read less
                  </button>
                )}
              </>
            ) : (
              <>
                {hasOverflow
                  ? getTruncatedText(memory.memory_summary, 200)
                  : memory.memory_summary}
                {hasOverflow && (
                  <>
                    <span className="text-ink-500">... </span>
                    <button
                      onClick={() => setSummaryExpanded(true)}
                      className="text-[12px] font-semibold text-juni hover:underline inline-block select-none"
                    >
                      Read more
                    </button>
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {/* Existing art rail */}
        {(existingArt.length > 0 || pendingJob || completedJob) && (
          <div className="mt-7">
            <MemoryArtRail
              art={existingArt}
              pendingJob={pendingJob}
              completedJob={completedJob}
              onResultTap={props.onResultTap}
            />
          </div>
        )}

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
          className="group flex items-center gap-1.5 pl-5 pr-5 py-3.5 rounded-full bg-juni text-white active:scale-[0.98] transition"
          style={{ boxShadow: "0 10px 18px rgba(91, 79, 233, 0.12)" }}
        >
          <span className="text-[14px] font-semibold">Create Artwork</span>
          <span className="w-[18px] h-[18px] text-[18px] font-bold leading-none flex items-center justify-center">+</span>
        </button>
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

function getTruncatedText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  let trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace > 0) {
    trimmed = trimmed.slice(0, lastSpace);
  }
  return trimmed;
}
