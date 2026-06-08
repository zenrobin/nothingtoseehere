"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { TypewriterText } from "./TypewriterText";
import { ThinkingDots } from "./ThinkingDots";
import { FAKE_MEMORIES } from "@/data/fakeMemories";

type Step = "welcome" | "photos" | "memory" | "idea";

interface Props {
  onClose: () => void;
  onSelectCurrentMemory: () => void;
}

const USER_NAME = "Robin";

const OPTIONS: {
  id: "photos" | "memory" | "idea";
  label: string;
  hint: string;
}[] = [
  {
    id: "photos",
    label: "Start with Photos",
    hint: "Start from selected photos",
  },
  {
    id: "memory",
    label: "Start with a Memory",
    hint: "Pick a memory to start from",
  },
  {
    id: "idea",
    label: "Start with an Idea",
    hint: "Describe what you want — Juni will work backward",
  },
];

function currentClock(): string {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${suffix}`;
}

export function GalleryStartSheet({ onClose, onSelectCurrentMemory }: Props) {
  const [step, setStep] = useState<Step>("welcome");
  const [welcome, setWelcome] = useState<string | null>(null);
  const [welcomeTyped, setWelcomeTyped] = useState(false);
  const [optionsRevealed, setOptionsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch the LLM-driven greeting on mount.
  useEffect(() => {
    let cancelled = false;
    const t0 = Date.now();
    fetch("/api/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: USER_NAME, localTime: currentClock() }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const elapsed = Date.now() - t0;
        const remaining = Math.max(0, 700 - elapsed);
        setTimeout(() => {
          if (!cancelled) setWelcome(data?.message || `${currentClock()} — ${USER_NAME}, it's time to create. Choose your starting point.`);
        }, remaining);
      })
      .catch(() => {
        if (cancelled) return;
        setWelcome(`${currentClock()} — ${USER_NAME}, it's time to create. Choose your starting point.`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // After welcome types in, fade options in.
  useEffect(() => {
    if (!welcomeTyped) return;
    const t = setTimeout(() => setOptionsRevealed(true), 200);
    return () => clearTimeout(t);
  }, [welcomeTyped]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="mt-auto relative h-[88%] bg-paper-cream rounded-t-3xl shadow-sheet animate-slide-up flex flex-col">
        <div className="pt-2 pb-1 flex flex-col items-center">
          <div className="w-10 h-1 rounded-full bg-ink-100" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-ink-100/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-juni text-white grid place-items-center text-[13px] font-bold">
              J
            </div>
            <div>
              <div className="text-[13px] font-semibold text-ink-900 leading-tight">
                Juni
              </div>
              <div className="text-[10px] text-ink-500 leading-tight">
                {step === "welcome" && "Memory creative assistant"}
                {step === "photos" && "Photo-first creation"}
                {step === "memory" && "Pick a memory"}
                {step === "idea" && "Idea-first creation"}
              </div>
            </div>
          </div>
          {step !== "welcome" && (
            <button
              onClick={() => setStep("welcome")}
              className="text-[11px] text-ink-500 font-medium px-3 py-1.5 rounded-full bg-white border border-ink-100"
            >
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 ml-1 rounded-full bg-ink-100/60 hover:bg-ink-100 grid place-items-center text-ink-700"
            aria-label="Close"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          ref={containerRef}
          className="flex-1 scroll-area no-scrollbar px-4 py-4"
        >
          {step === "welcome" && (
            <WelcomeBody
              welcome={welcome}
              welcomeTyped={welcomeTyped}
              setWelcomeTyped={setWelcomeTyped}
              optionsRevealed={optionsRevealed}
              onPickOption={(id) => setStep(id)}
            />
          )}
          {step === "photos" && <PhotosFlow onClose={onClose} />}
          {step === "memory" && (
            <MemoryListFlow onSelectCurrent={onSelectCurrentMemory} />
          )}
          {step === "idea" && <IdeaChatFlow onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

// ===== Welcome step =====

function WelcomeBody({
  welcome,
  welcomeTyped,
  setWelcomeTyped,
  optionsRevealed,
  onPickOption,
}: {
  welcome: string | null;
  welcomeTyped: boolean;
  setWelcomeTyped: (v: boolean) => void;
  optionsRevealed: boolean;
  onPickOption: (id: "photos" | "memory" | "idea") => void;
}) {
  return (
    <div className="space-y-4">
      <JuniBubble>
        {welcome ? (
          <p className="text-[14px] leading-relaxed text-ink-900">
            <TypewriterText
              text={welcome}
              speedMs={12}
              onDone={() => setWelcomeTyped(true)}
            />
          </p>
        ) : (
          <ThinkingDots />
        )}
      </JuniBubble>

      {optionsRevealed && (
        <div className="space-y-2 animate-fade-in pl-[42px]">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onPickOption(opt.id)}
              className="w-full text-left rounded-2xl bg-white shadow-card px-4 py-3 flex items-center justify-between active:scale-[0.99] transition"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-ink-900">
                  {opt.label}
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5">
                  {opt.hint}
                </div>
              </div>
              <span className="text-ink-300 text-[18px] leading-none">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Photos sub-flow =====

function PhotosFlow({ onClose }: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<{ name: string; dataUrl: string }[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const next: { name: string; dataUrl: string }[] = [];
    for (const f of Array.from(files)) {
      const url = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.readAsDataURL(f);
      });
      next.push({ name: f.name, dataUrl: url });
    }
    setPhotos((prev) => [...prev, ...next]);
    setReviewing(true);
    setReviewed(false);
    setTimeout(() => {
      setReviewing(false);
      setReviewed(true);
    }, 1400);
  }

  return (
    <div className="space-y-4">
      <JuniBubble>
        <p className="text-[14px] leading-relaxed text-ink-900">
          Drop in one or more photos. I&apos;ll look at what&apos;s in them and
          suggest a few things we could make.
        </p>
      </JuniBubble>

      <div className="pl-[42px]">
        <label
          htmlFor="gallery-photo-input"
          className="block w-full rounded-2xl bg-white shadow-card px-4 py-6 text-center cursor-pointer border-2 border-dashed border-ink-100 hover:border-juni/40 transition active:scale-[0.99]"
        >
          <div className="text-[14px] font-semibold text-ink-900">
            {photos.length === 0 ? "Choose photos" : "Add more photos"}
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            JPG / PNG / HEIC · pick as many as you like
          </div>
        </label>
        <input
          id="gallery-photo-input"
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>

      {photos.length > 0 && (
        <div className="pl-[42px]">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={p.dataUrl}
                alt={p.name}
                className="w-16 h-16 object-cover rounded-lg shadow-card shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {reviewing && (
        <JuniBubble>
          <ThinkingDots label={`Looking at ${photos.length} photo${photos.length > 1 ? "s" : ""}…`} />
        </JuniBubble>
      )}

      {reviewed && (
        <JuniBubble>
          <p className="text-[14px] leading-relaxed text-ink-900 mb-2">
            Good set. From these, I&apos;d try one of:
          </p>
          <div className="flex flex-col gap-1.5">
            {["A printed photo book", "A single GenArt print", "A short movie", "A magazine spread"].map((label) => (
              <button
                key={label}
                onClick={onClose}
                className="text-left text-[13px] font-medium text-juni-ink bg-juni-soft hover:bg-juni-soft/80 rounded-xl px-3 py-2 transition"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-ink-500">
            Or describe what you want and I&apos;ll build from that.
          </p>
        </JuniBubble>
      )}
    </div>
  );
}

// ===== Memory list sub-flow =====

function MemoryListFlow({ onSelectCurrent }: { onSelectCurrent: () => void }) {
  const settings = useAppStore((s) => s.settings);
  const memory = settings.memory;

  return (
    <div className="space-y-3">
      <JuniBubble>
        <p className="text-[14px] leading-relaxed text-ink-900">
          Here&apos;s what I&apos;m seeing in your library. Pick one to dig in.
        </p>
      </JuniBubble>

      <div className="pl-[42px] space-y-2">
        {memory && (
          <button
            onClick={onSelectCurrent}
            className="w-full text-left rounded-2xl bg-white shadow-card overflow-hidden active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-juni-soft to-juni-peach grid place-items-center shrink-0 text-[10px] font-mono font-semibold text-juni-ink">
                {memory.snappy_title?.slice(0, 2).toUpperCase() ?? "MX"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-ink-900 truncate">
                  {memory.snappy_title}
                </div>
                <div className="text-[11px] text-ink-500 truncate">
                  Currently loaded · {settings.photoAnalyses.length} photo
                  {settings.photoAnalyses.length === 1 ? "" : "s"}
                </div>
              </div>
              <span className="text-juni text-[11px] uppercase tracking-widest font-semibold">
                Open
              </span>
            </div>
          </button>
        )}

        {FAKE_MEMORIES.map((m) => (
          <div
            key={m.id}
            className="w-full text-left rounded-2xl bg-white/60 shadow-sm overflow-hidden opacity-60"
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${m.gradient} grid place-items-center shrink-0 text-[10px] font-mono font-semibold text-ink-900/80`}
              >
                {m.snappy_title.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-ink-700 truncate">
                  {m.snappy_title}
                </div>
                <div className="text-[11px] text-ink-500 truncate">
                  {m.date} · {m.location} · {m.photoCount} photos
                </div>
              </div>
              <span className="text-ink-300 text-[10px] uppercase tracking-widest font-semibold">
                Soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Idea sub-flow =====

function IdeaChatFlow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<
    { role: "user" | "juni"; text: string }[]
  >([
    {
      role: "juni",
      text:
        "Tell me what you're imagining. I can build a photo book, a piece of art, a movie, or a magazine — what's the moment we're capturing?",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    // Placeholder mock response — wire up to /api/juni with conversation
    // context type "idea-chat" later.
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "juni",
          text: `"${text}" — got it. Sounds like a ${
            /book|magaz/i.test(text)
              ? "magazine spread"
              : /movie|video|clip/i.test(text)
              ? "movie"
              : /art|print|paint/i.test(text)
              ? "GenArt print"
              : "photo book"
          } would land that. Want to keep refining, or jump in?`,
        },
      ]);
      setThinking(false);
    }, 900);
  }

  return (
    <div className="space-y-3">
      {messages.map((m, i) =>
        m.role === "juni" ? (
          <JuniBubble key={i}>
            <p className="text-[14px] leading-relaxed text-ink-900">{m.text}</p>
          </JuniBubble>
        ) : (
          <UserBubble key={i}>{m.text}</UserBubble>
        )
      )}
      {thinking && (
        <JuniBubble>
          <ThinkingDots />
        </JuniBubble>
      )}

      <div className="pt-3 sticky bottom-0 bg-paper-cream/95 backdrop-blur -mx-4 px-4 pb-2">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-card border border-ink-100/70">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="What are you imagining?"
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-ink-300 text-ink-900"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full bg-juni text-white grid place-items-center disabled:opacity-40 active:scale-95"
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l14-7-5 14-2.5-5L5 12z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Shared bubble visuals =====

function JuniBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 animate-fade-in pr-10">
      <div className="w-8 h-8 shrink-0 rounded-full bg-juni text-white grid place-items-center text-[12px] font-bold shadow-card">
        J
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-juni font-semibold mb-1">
          Juni
        </div>
        <div className="rounded-2xl rounded-tl-md bg-white shadow-card px-4 py-3 text-[14px] leading-relaxed text-ink-900">
          {children}
        </div>
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-end animate-fade-in pl-10">
      <div className="rounded-2xl rounded-tr-md bg-juni-soft text-juni-ink px-4 py-2.5 text-[13.5px] leading-relaxed max-w-[80%]">
        {children}
      </div>
    </div>
  );
}
