"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { parseMemoryZip } from "@/lib/zipMemoryParser";
import type { PhotoAnalysis } from "@/types";

interface Props {
  onDone: () => void;
}

const MEMORY_EXPORT_URL =
  "https://www.mixbook.com/admin/playground/memory_episodes";

export function SetupScreen({ onDone }: Props) {
  const loadFromZip = useAppStore((s) => s.loadMemoryFromZip);

  const [zipName, setZipName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedMemoryTitle, setParsedMemoryTitle] = useState<string | null>(null);
  const [parsedMemory, setParsedMemory] = useState<{
    memory: any;
    photoAnalyses: PhotoAnalysis[];
  } | null>(null);

  async function handleZip(file: File | undefined) {
    if (!file) return;
    setParsing(true);
    setError(null);
    setZipName(file.name);
    try {
      const parsed = await parseMemoryZip(file);
      setParsedMemory({
        memory: parsed.memory,
        photoAnalyses: parsed.photoAnalyses,
      });
      setParsedMemoryTitle(parsed.memory.snappy_title || parsed.memory.id);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't parse that ZIP");
      setZipName(null);
    } finally {
      setParsing(false);
    }
  }

  function commitAndContinue() {
    if (parsedMemory) {
      loadFromZip({
        memory: parsedMemory.memory,
        photoAnalyses: parsedMemory.photoAnalyses,
      });
    }
    onDone();
  }

  const primaryLabel = parsedMemory
    ? `Continue with "${parsedMemoryTitle}"`
    : "Use the sample memory";

  return (
    <div className="absolute inset-0 z-50 bg-paper flex flex-col">
      {/* Decorative orb header */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 30%, rgba(91,79,233,0.25), transparent 70%), radial-gradient(40% 60% at 70% 80%, rgba(245,198,165,0.4), transparent 70%), #F7F5F1",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-9 w-20 h-20 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #ffffff, #C9C2FB 40%, #5B4FE9 90%)",
            boxShadow: "0 16px 40px rgba(91,79,233,0.35)",
            animation: "float-orb 4.5s ease-in-out infinite",
          }}
        />
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col scroll-area">
        <div className="text-[11px] uppercase tracking-widest text-juni font-semibold">
          Prototype
        </div>
        <h1 className="mt-1 font-serif text-[26px] leading-[1.15] tracking-tight text-ink-900">
          Welcome to the Juni Create From Scratch prototype.
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-700">
          Select a memory, and experience what it's like to use Juni to create
          with it.
        </p>

        <div className="mt-5 rounded-2xl bg-juni-soft/70 border border-juni/15 px-4 py-3 text-[12px] leading-relaxed text-juni-ink">
          You can download a single memory by going to{" "}
          <a
            href={MEMORY_EXPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold break-all"
          >
            mixbook.com/admin/playground/memory_episodes
          </a>
          , selecting a memory, then choosing <span className="font-semibold">Export</span>.
        </div>

        <div className="mt-6">
          <UploadLabel
            htmlFor="setup-zip"
            title="Memory ZIP"
            subtitle={
              zipName
                ? parsing
                  ? `Reading ${zipName}…`
                  : `${zipName}${
                      parsedMemoryTitle ? ` · "${parsedMemoryTitle}"` : ""
                    }`
                : "memory-episode-*.zip"
            }
            accent={!!parsedMemory}
            cta={parsedMemory ? "Change" : "Choose file"}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V4M12 4l-5 5m5-5l5 5M4 20h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <input
            id="setup-zip"
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              handleZip(f);
              e.currentTarget.value = "";
            }}
          />

          {error && (
            <div className="mt-2 text-[12px] text-red-500 px-1">{error}</div>
          )}
        </div>

        <div className="mt-auto pt-6 space-y-2">
          <button
            onClick={commitAndContinue}
            disabled={parsing}
            className="w-full py-3.5 rounded-full bg-juni text-white text-[14px] font-semibold shadow-card disabled:opacity-50 active:scale-[0.99]"
          >
            {primaryLabel}
          </button>
          {parsedMemory && (
            <button
              onClick={onDone}
              className="w-full py-2.5 rounded-full text-[12px] font-medium text-ink-500"
            >
              Skip and use the sample memory
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadLabel({
  htmlFor,
  title,
  subtitle,
  accent,
  cta,
  icon,
}: {
  htmlFor: string;
  title: string;
  subtitle: string;
  accent?: boolean;
  cta: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`w-full rounded-2xl shadow-card p-4 flex items-center gap-3 active:scale-[0.99] transition border cursor-pointer ${
        accent
          ? "bg-juni-soft border-juni/30"
          : "bg-white border-transparent"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${
          accent ? "bg-juni text-white" : "bg-paper-warm text-ink-700"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-[13px] font-semibold text-ink-900">{title}</div>
        <div className="text-[11px] text-ink-500 line-clamp-2 mt-0.5">
          {subtitle}
        </div>
      </div>
      <div className="text-[11px] font-semibold text-juni shrink-0">{cta}</div>
    </label>
  );
}
