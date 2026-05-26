"use client";

import React, { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { parseMemoryZip } from "@/lib/zipMemoryParser";
import { TypewriterText } from "./TypewriterText";
import type { PhotoAnalysis } from "@/types";

interface Props {
  onDone: () => void;
}

type Stage = "intro" | "ready";

export function SetupScreen({ onDone }: Props) {
  const settings = useAppStore((s) => s.settings);
  const loadFromZip = useAppStore((s) => s.loadMemoryFromZip);
  const setSettings = useAppStore((s) => s.setSettings);

  const zipRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [zipName, setZipName] = useState<string | null>(null);
  const [extraPhotos, setExtraPhotos] = useState<
    { file: File; dataUrl: string; photoId: number | null }[]
  >([]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedMemoryTitle, setParsedMemoryTitle] = useState<string | null>(null);
  const [parsedMemory, setParsedMemory] = useState<{
    memory: any;
    photoAnalyses: PhotoAnalysis[];
  } | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [introDone, setIntroDone] = useState(false);

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

  async function handlePhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next: typeof extraPhotos = [];
    for (const file of Array.from(files)) {
      const dataUrl = await fileToDataUrl(file);
      const idMatch = file.name.match(/(\d{4,})/);
      next.push({
        file,
        dataUrl,
        photoId: idMatch ? Number(idMatch[1]) : null,
      });
    }
    setExtraPhotos((prev) => [...prev, ...next]);
  }

  function commitAndContinue() {
    if (parsedMemory) {
      const photoAnalyses = mergePhotosIntoAnalyses(
        parsedMemory.photoAnalyses,
        extraPhotos
      );
      loadFromZip({ memory: parsedMemory.memory, photoAnalyses });
    } else if (extraPhotos.length > 0) {
      const photoAnalyses = mergePhotosIntoAnalyses(
        settings.photoAnalyses,
        extraPhotos
      );
      setSettings((s) => ({ ...s, photoAnalyses }));
    }
    onDone();
  }

  function skip() {
    onDone();
  }

  return (
    <div className="absolute inset-0 z-50 bg-paper flex flex-col">
      {/* Decorative orb header */}
      <div className="relative h-44 overflow-hidden">
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

      <div className="flex-1 px-6 pb-6 flex flex-col">
        <div className="text-[11px] uppercase tracking-widest text-juni font-semibold">
          Juni
        </div>
        <h1 className="mt-1 font-serif text-[28px] leading-tight tracking-tight text-ink-900">
          <TypewriterText
            text="Hi — I'm Juni. Let's start with a memory."
            speedMs={18}
            onDone={() => setIntroDone(true)}
            cursor
          />
        </h1>

        {introDone && (
          <p className="mt-3 text-[13px] leading-relaxed text-ink-700 animate-fade-in">
            <TypewriterText
              text="Drop in a memory ZIP (and any photos you want me to see), or skip and use the sample memory."
              speedMs={10}
              cursor={false}
            />
          </p>
        )}

        <div className="mt-6 space-y-3">
          <UploadCard
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
            onClick={() => zipRef.current?.click()}
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
            cta={parsedMemory ? "Change" : "Choose file"}
          />
          <input
            ref={zipRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            hidden
            onChange={(e) => handleZip(e.target.files?.[0])}
          />

          <UploadCard
            title="Photos (optional)"
            subtitle={
              extraPhotos.length > 0
                ? `${extraPhotos.length} photo${
                    extraPhotos.length > 1 ? "s" : ""
                  } added`
                : "Drop in photos from the memory — Juni will pair them with analyses if it can."
            }
            accent={extraPhotos.length > 0}
            onClick={() => photoRef.current?.click()}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
                <path d="M21 17l-5-5-6 6" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
            cta="Add photos"
          />
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handlePhotos(e.target.files)}
          />

          {extraPhotos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
              {extraPhotos.map((p, i) => (
                <div key={i} className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.dataUrl}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover shadow-card"
                  />
                  {p.photoId !== null && (
                    <div className="absolute -bottom-1 -right-1 text-[8px] bg-juni text-white rounded-full px-1.5 py-0.5 font-semibold">
                      #{p.photoId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-[12px] text-red-500 px-1">{error}</div>
          )}
        </div>

        <div className="mt-auto pt-6 space-y-2">
          <button
            onClick={commitAndContinue}
            disabled={parsing}
            className="w-full py-3.5 rounded-full bg-juni text-white text-[14px] font-semibold shadow-card disabled:opacity-50 active:scale-[0.99]"
          >
            {parsedMemory
              ? `Continue with "${parsedMemoryTitle}"`
              : extraPhotos.length > 0
              ? "Continue with these photos"
              : "Use the sample memory"}
          </button>
          {(parsedMemory || extraPhotos.length > 0) && (
            <button
              onClick={skip}
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

function UploadCard({
  title,
  subtitle,
  accent,
  onClick,
  icon,
  cta,
}: {
  title: string;
  subtitle: string;
  accent?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  cta: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl shadow-card p-4 flex items-center gap-3 active:scale-[0.99] transition border ${
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
    </button>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function mergePhotosIntoAnalyses(
  analyses: PhotoAnalysis[],
  extras: { file: File; dataUrl: string; photoId: number | null }[]
): PhotoAnalysis[] {
  if (extras.length === 0) return analyses;
  const next = analyses.map((a) => ({ ...a }));
  const used = new Set<number>();
  // Pair by photo_id match
  for (const e of extras) {
    if (e.photoId === null) continue;
    const idx = next.findIndex((a) => a.photo_id === e.photoId);
    if (idx >= 0 && !next[idx].imageDataUrl) {
      next[idx] = { ...next[idx], imageDataUrl: e.dataUrl };
      used.add(extras.indexOf(e));
    }
  }
  // Anything else, attach to remaining analyses without an image, in order
  let writeIdx = 0;
  for (let i = 0; i < extras.length; i++) {
    if (used.has(i)) continue;
    while (writeIdx < next.length && next[writeIdx].imageDataUrl) writeIdx++;
    if (writeIdx < next.length) {
      next[writeIdx] = { ...next[writeIdx], imageDataUrl: extras[i].dataUrl };
      writeIdx++;
    } else {
      // Add a synthetic photo entry so the photo still shows up in media
      next.push({
        photo_id: 9000000 + i,
        description: extras[i].file.name,
        scores: { aesthetic: 0, emotional: 0, memory_value: 0 },
        key_elements: [],
        location_context: "",
        time_context: "",
        imageDataUrl: extras[i].dataUrl,
      });
    }
  }
  return next;
}
