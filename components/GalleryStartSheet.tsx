"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { TypewriterText } from "./TypewriterText";
import { ThinkingDots } from "./ThinkingDots";
import { CameraRollPicker } from "./CameraRollPicker";
import { FAKE_MEMORIES } from "@/data/fakeMemories";
import { loggedFetchRecommendations } from "@/lib/llmCalls";
import type {
  CreativeBrief,
  JuniRecommendation,
  JuniRecommendationsResponse,
  PhotoAnalysis,
} from "@/types";

type Step = "welcome" | "photos" | "memory" | "idea";

interface Props {
  onClose: () => void;
  onSelectCurrentMemory: () => void;
  /**
   * Hand the chosen creative brief back to the page so it can decrement
   * creations, start a generation job, and close the gallery. Mirrors
   * the JuniSheet brief flow.
   */
  onConfirmBrief: (brief: CreativeBrief) => void;
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

export function GalleryStartSheet({
  onClose,
  onSelectCurrentMemory,
  onConfirmBrief,
}: Props) {
  const [step, setStep] = useState<Step>("welcome");
  const [welcome, setWelcome] = useState<string | null>(null);
  const [welcomeTyped, setWelcomeTyped] = useState(false);
  const [optionsRevealed, setOptionsRevealed] = useState(false);

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
        const remaining = Math.max(0, 700 - (Date.now() - t0));
        setTimeout(() => {
          if (!cancelled)
            setWelcome(
              data?.message ||
                `${currentClock()} — ${USER_NAME}, it's time to create. Choose your starting point.`
            );
        }, remaining);
      })
      .catch(() => {
        if (cancelled) return;
        setWelcome(
          `${currentClock()} — ${USER_NAME}, it's time to create. Choose your starting point.`
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
          <div className="flex items-center gap-1.5">
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
              className="w-8 h-8 rounded-full bg-ink-100/60 hover:bg-ink-100 grid place-items-center text-ink-700"
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
        </div>

        {/* Body */}
        <div className="flex-1 scroll-area no-scrollbar px-4 py-4">
          {step === "welcome" && (
            <WelcomeBody
              welcome={welcome}
              setWelcomeTyped={setWelcomeTyped}
              optionsRevealed={optionsRevealed}
              onPickOption={(id) => setStep(id)}
            />
          )}
          {step === "photos" && (
            <PhotosFlow onConfirmBrief={onConfirmBrief} />
          )}
          {step === "memory" && (
            <MemoryListFlow onSelectCurrent={onSelectCurrentMemory} />
          )}
          {step === "idea" && (
            <IdeaChatFlow onConfirmBrief={onConfirmBrief} />
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Welcome step =====

function WelcomeBody({
  welcome,
  setWelcomeTyped,
  optionsRevealed,
  onPickOption,
}: {
  welcome: string | null;
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

function PhotosFlow({
  onConfirmBrief,
}: {
  onConfirmBrief: (brief: CreativeBrief) => void;
}) {
  const settings = useAppStore((s) => s.settings);
  const setRecs = useAppStore((s) => s.setRecommendations);
  const setDebug = useAppStore((s) => s.setDebug);

  const [pickerOpen, setPickerOpen] = useState(true);
  const [selected, setSelected] = useState<PhotoAnalysis[]>([]);
  const [recs, setRecsLocal] = useState<JuniRecommendationsResponse | null>(
    null
  );
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reviewPhotos(picks: PhotoAnalysis[]) {
    setSelected(picks);
    setPickerOpen(false);
    setRecsLocal(null);
    setThinking(true);
    setError(null);
    try {
      // CRITICAL: do not pass the loaded memory's narrative / title / sections —
      // the user picked photos out of context and wants ideas centered on the
      // photos themselves, not on the trip the photos came from.
      const stubMemory = {
        id: "photo-first",
        one_word_title: "",
        snappy_title: "",
        medium_title: "",
        detailed_title: "",
        descriptive_title: "",
        memory_summary: "",
        memory_narrative: "",
        editorial_intro: "",
        score: 0,
        emotional_tone: "",
        cover_photo_id: picks[0]?.photo_id ?? 0,
        categories: [],
        timeline: [],
      } as any;

      const ctx = {
        memory: stubMemory,
        photoAnalyses: picks,
        existingArt: [],
        artForms: settings.artForms,
        capabilities: settings.capabilities,
      };
      const resp = await loggedFetchRecommendations("freeform", {
        settings: {
          llm: settings.llm,
          prompts: settings.prompts,
          style: settings.style,
          capabilities: settings.capabilities,
        },
        context: ctx,
        conversation: { photoFirst: true },
      });
      if (!resp) {
        setError("No response from Juni.");
        return;
      }
      setRecsLocal(resp.data);
      setRecs(resp.data);
      setDebug({
        lastContext: ctx,
        lastRequest: resp.debug.request,
        lastResponse: resp.debug.response,
      });
    } catch (e: any) {
      setError(e?.message ?? "Couldn't reach Juni.");
    } finally {
      setThinking(false);
    }
  }

  if (pickerOpen) {
    return (
      <CameraRollPicker
        photos={settings.photoAnalyses}
        onConfirm={reviewPhotos}
        onCancel={() => setPickerOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {selected.length === 0 ? (
        <JuniBubble>
          <p className="text-[14px] text-ink-900 mb-3">
            Pick some photos and I&apos;ll take a look.
          </p>
          <button
            onClick={() => setPickerOpen(true)}
            className="text-[13px] font-semibold text-juni"
          >
            Choose photos
          </button>
        </JuniBubble>
      ) : (
        <>
          <div className="pl-[42px]">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {selected.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.photo_id}
                  src={p.imageDataUrl}
                  alt=""
                  className="w-14 h-14 object-cover rounded-lg shadow-card shrink-0"
                />
              ))}
              <button
                onClick={() => setPickerOpen(true)}
                className="w-14 h-14 rounded-lg border-2 border-dashed border-ink-200 text-[10px] font-semibold text-ink-500 hover:border-juni/40"
              >
                Edit
              </button>
            </div>
          </div>

          {thinking && (
            <JuniBubble>
              <ThinkingDots
                label={`Looking at ${selected.length} photo${
                  selected.length > 1 ? "s" : ""
                }…`}
              />
            </JuniBubble>
          )}
          {error && (
            <JuniBubble>
              <p className="text-[13px] text-red-600">{error}</p>
            </JuniBubble>
          )}
          {recs && (
            <RecommendationsList
              recs={recs}
              selected={selected}
              onPick={(rec) =>
                onConfirmBrief(buildBriefFromRecommendation(rec, selected))
              }
            />
          )}
        </>
      )}
    </div>
  );
}

// ===== Memory list sub-flow =====

function MemoryListFlow({
  onSelectCurrent,
}: {
  onSelectCurrent: () => void;
}) {
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

interface ChatMsg {
  role: "user" | "juni";
  content: string;
  recs?: JuniRecommendation[];
}

function IdeaChatFlow({
  onConfirmBrief,
}: {
  onConfirmBrief: (brief: CreativeBrief) => void;
}) {
  const settings = useAppStore((s) => s.settings);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "juni",
      content:
        "Tell me what you're imagining. I can build a photo book, a piece of art, a movie, or a magazine — what's the moment we're capturing?",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    const history: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setThinking(true);
    try {
      const ctx = {
        memory: settings.memory!,
        photoAnalyses: settings.photoAnalyses,
        existingArt: [],
        artForms: settings.artForms,
        capabilities: settings.capabilities,
      };
      const resp = await loggedFetchRecommendations("freeform", {
        settings: {
          llm: settings.llm,
          prompts: settings.prompts,
          style: settings.style,
          capabilities: settings.capabilities,
        },
        context: ctx,
        conversation: {
          userMessage: text,
          ideaChat: true,
          messageHistory: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });
      if (!resp) throw new Error("No response");
      setMessages((m) => [
        ...m,
        {
          role: "juni",
          content: resp.data.openingMessage,
          recs:
            resp.data.recommendations && resp.data.recommendations.length > 0
              ? resp.data.recommendations
              : undefined,
        },
      ]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: "juni",
          content:
            "I couldn't reach my brain just now — say that again in a moment?",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div ref={scrollerRef} className="space-y-3">
      {messages.map((m, i) =>
        m.role === "juni" ? (
          <div key={i} className="space-y-2">
            <JuniBubble>
              <p className="text-[14px] leading-relaxed text-ink-900">
                {m.content}
              </p>
            </JuniBubble>
            {m.recs && m.recs.length > 0 && (
              <div className="pl-[42px] space-y-1.5">
                {m.recs.map((r) => (
                  <button
                    key={r.id}
                    onClick={() =>
                      onConfirmBrief(buildBriefFromRecommendation(r))
                    }
                    className="w-full text-left rounded-2xl bg-white shadow-card px-4 py-3 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full text-white ${
                          r.artform === "movie"
                            ? "bg-slate-900"
                            : "bg-orange-950"
                        }`}
                      >
                        {r.artform === "movie" ? "Movie" : "GenArt"}
                      </span>
                      <span className="text-[13.5px] font-semibold text-ink-900">
                        {r.title}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-ink-600 leading-snug">
                      {r.why}
                    </p>
                    <div className="mt-2 text-[11px] font-semibold text-juni">
                      Make this {r.artform === "movie" ? "movie" : "artwork"} →
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <UserBubble key={i}>{m.content}</UserBubble>
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
            disabled={!input.trim() || thinking}
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

// ===== Recommendations rendering used by Photos flow =====

function RecommendationsList({
  recs,
  selected,
  onPick,
}: {
  recs: JuniRecommendationsResponse;
  selected: PhotoAnalysis[];
  onPick: (rec: JuniRecommendation) => void;
}) {
  return (
    <div className="space-y-3">
      <JuniBubble>
        <p className="text-[14px] leading-relaxed text-ink-900">
          {recs.openingMessage}
        </p>
      </JuniBubble>
      <div className="pl-[42px] space-y-2">
        {recs.recommendations.map((r) => {
          const isMovie = r.artform === "movie";
          return (
            <button
              key={r.id}
              onClick={() => onPick(r)}
              className="w-full text-left rounded-2xl bg-white shadow-card px-4 py-3 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full text-white ${
                    isMovie ? "bg-slate-900" : "bg-orange-950"
                  }`}
                >
                  {isMovie ? "Movie" : "GenArt"}
                </span>
                <span className="text-[13.5px] font-semibold text-ink-900">
                  {r.title}
                </span>
              </div>
              <p className="text-[11.5px] text-ink-600 leading-snug">
                {r.description}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10.5px] text-ink-400">
                  From {selected.length} photo
                  {selected.length === 1 ? "" : "s"}
                </span>
                <span className="text-[11px] font-semibold text-juni">
                  Make this {isMovie ? "movie" : "artwork"} →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildBriefFromRecommendation(
  rec: JuniRecommendation,
  photos?: PhotoAnalysis[]
): CreativeBrief {
  return {
    artform: rec.artform,
    sourceMemoryId: "gallery-first",
    conceptId: rec.id,
    conceptTitle: rec.title,
    templateId: rec.suggestedTemplateId,
    templateName: null,
    tone: "personal and warm",
    keyDetails: photos?.slice(0, 4).map((p) => p.description.slice(0, 60)) ?? [],
    differentiator: rec.why,
    summary: rec.description,
  };
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
