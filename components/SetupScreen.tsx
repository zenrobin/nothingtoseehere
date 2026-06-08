"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { parseMemoryZip } from "@/lib/zipMemoryParser";
import { loggedFetchRecommendations, trace } from "@/lib/llmCalls";
import { CHANGELOG, type ChangelogEntry } from "@/data/changelog";
import type { Memory, PhotoAnalysis } from "@/types";

interface Props {
  onDone: () => void;
}

const MEMORY_EXPORT_URL =
  "https://www.mixbook.com/admin/playground/memory_episodes";

export function SetupScreen({ onDone }: Props) {
  const loadFromZip = useAppStore((s) => s.loadMemoryFromZip);
  const settings = useAppStore((s) => s.settings);
  const setRecs = useAppStore((s) => s.setRecommendations);
  const setDebug = useAppStore((s) => s.setDebug);

  const [zipName, setZipName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedMemoryTitle, setParsedMemoryTitle] = useState<string | null>(null);
  const [parsedMemory, setParsedMemory] = useState<{
    memory: any;
    photoAnalyses: PhotoAnalysis[];
  } | null>(null);
  const [preparing, setPreparing] = useState(false);
  const hasExistingMemory = !!settings.memory;

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

  async function commitAndContinue() {
    if (!parsedMemory) return; // require a ZIP — no sample fallback
    setPreparing(true);
    setError(null);

    // Land the chosen memory in the store so the recommendation request
    // builds against it, even before we move on to the Memory Detail screen.
    loadFromZip({
      memory: parsedMemory.memory,
      photoAnalyses: parsedMemory.photoAnalyses,
    });
    const activeMemory: Memory = parsedMemory.memory as Memory;
    const activePhotoAnalyses: PhotoAnalysis[] = parsedMemory.photoAnalyses;

    // Pre-read while still on the Setup screen so the chat itself feels
    // close to instant once the user opens it.
    try {
      const existingArt =
        parsedMemory && activeMemory.id !== settings.memory?.id
          ? []
          : settings.existingArt;
      const ctx = {
        memory: activeMemory,
        photoAnalyses: activePhotoAnalyses,
        existingArt,
        artForms: settings.artForms,
        capabilities: settings.capabilities,
      };
      const resp = await loggedFetchRecommendations("setup-prefetch", {
        settings: {
          llm: settings.llm,
          prompts: settings.prompts,
          style: settings.style,
          capabilities: settings.capabilities,
        },
        context: ctx,
      });
      if (!resp) return;
      setRecs(resp.data);
      setDebug({
        lastContext: ctx,
        lastRequest: resp.debug.request,
        lastResponse: resp.debug.response,
      });
      trace(
        `[setup] commit finished — setRecs done, calling onDone(). store-recs=${
          useAppStore.getState().recommendations ? "set" : "null"
        }`
      );
      onDone();
    } catch (e: any) {
      // Don't block — surface the error in the chat as before.
      console.warn("Setup prefetch failed", e);
      setError(
        "Juni couldn't reach the LLM. We'll show you the memory and you can try from there."
      );
      onDone();
    } finally {
      setPreparing(false);
    }
  }

  const primaryLabel = preparing
    ? "Juni is reading your memory…"
    : parsedMemory
    ? `Continue with "${parsedMemoryTitle}"`
    : "Choose a memory ZIP to continue";

  const canContinue = !!parsedMemory && !preparing && !parsing;

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
      {/* Floating Close Button */}
      {hasExistingMemory && (
        <button
          onClick={onDone}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/30 active:scale-95 transition"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {/* Decorative orb header */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 30%, rgba(91,79,233,0.25), transparent 70%), radial-gradient(40% 60% at 70% 80%, rgba(245,198,165,0.4), transparent 70%), #ffffff",
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

      <div className="flex-1 px-6 pt-8 pb-6 flex flex-col scroll-area">
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

          <div className="mt-6">
            <button
              onClick={commitAndContinue}
              disabled={!canContinue}
              className="w-full py-3.5 rounded-full bg-juni text-white text-[14px] font-semibold shadow-card disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {primaryLabel}
            </button>
          </div>

          <Changelog />
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

function Changelog() {
  if (CHANGELOG.length === 0) return null;
  return (
    <div className="mt-6">
      <div className="text-[10px] uppercase tracking-widest text-ink-500 font-semibold mb-2">
        Recent updates
      </div>
      <ul className="space-y-2.5">
        {CHANGELOG.slice(0, 6).map((entry, i) => (
          <ChangelogRow key={i} entry={entry} />
        ))}
      </ul>
    </div>
  );
}

function ChangelogRow({ entry }: { entry: ChangelogEntry }) {
  return (
    <li className="rounded-xl bg-white border border-ink-100 px-3 py-2.5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold text-juni-ink">
          {entry.who}
        </span>
        <span className="text-[10px] font-mono text-ink-400 shrink-0">
          {formatRelative(entry.when)}
        </span>
      </div>
      <div className="text-[12px] leading-snug text-ink-700 mt-1">
        {entry.what}
      </div>
    </li>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
