"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fetchRecommendations } from "@/lib/juniClient";
import type {
  CreativeBrief as CreativeBriefT,
  JuniRecommendation,
  MovieControls,
} from "@/types";
import { Chips } from "./Chips";
import { RecommendationCards } from "./RecommendationCards";
import { CreativeBriefCard } from "./CreativeBrief";
import { buildMockBrief } from "@/lib/juniClient";
import { MoviePathPanel } from "./MoviePath";
import { TypewriterText } from "./TypewriterText";
import { ThinkingDots } from "./ThinkingDots";

interface Props {
  onConfirmBrief: (brief: CreativeBriefT) => void;
  onClose: () => void;
}

export function JuniSheet({ onConfirmBrief, onClose }: Props) {
  const settings = useAppStore((s) => s.settings);
  const juniState = useAppStore((s) => s.juniState);
  const setJuniState = useAppStore((s) => s.setJuniState);
  const recs = useAppStore((s) => s.recommendations);
  const setRecs = useAppStore((s) => s.setRecommendations);
  const selectedRecId = useAppStore((s) => s.selectedRecId);
  const setSelectedRec = useAppStore((s) => s.setSelectedRec);
  const followupAnswer = useAppStore((s) => s.followupAnswer);
  const setFollowupAnswer = useAppStore((s) => s.setFollowupAnswer);
  const setBrief = useAppStore((s) => s.setBrief);
  const setDebug = useAppStore((s) => s.setDebug);

  const [error, setError] = useState<string | null>(null);
  const [freeform, setFreeform] = useState("");
  const [movieControls, setMovieControls] = useState<MovieControls | undefined>(
    undefined
  );

  const memory = settings.memory!;
  const selectedRec: JuniRecommendation | undefined = useMemo(
    () => recs?.recommendations.find((r) => r.id === selectedRecId),
    [recs, selectedRecId]
  );

  // Load recommendations on open
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (recs) return;
      setJuniState("recommendations_loading");
      try {
        const ctx = {
          memory,
          photoAnalyses: settings.photoAnalyses,
          existingArt: settings.existingArt,
          artForms: settings.artForms,
          capabilities: settings.capabilities,
        };
        const resp = await fetchRecommendations({
          settings: {
            llm: settings.llm,
            prompts: settings.prompts,
            style: settings.style,
            capabilities: settings.capabilities,
          },
          context: ctx,
        });
        if (cancelled) return;
        setRecs(resp.data);
        setDebug({
          lastContext: ctx,
          lastRequest: resp.debug.request,
          lastResponse: resp.debug.response,
        });
        setJuniState("recommendations_ready");
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Failed to load recommendations");
        setJuniState("recommendations_ready");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickRec(id: string) {
    setSelectedRec(id);
    setFollowupAnswer(null);
    setMovieControls(undefined);
    setJuniState("concept_selected");
  }

  function answerFollowup(chip: string) {
    setFollowupAnswer(chip);
    setJuniState("followup_answered");
  }

  function moreIdeas() {
    setRecs(null);
    setSelectedRec(null);
    setFollowupAnswer(null);
    setJuniState("recommendations_loading");
    // re-run effect
    setTimeout(() => {
      const ctx = {
        memory,
        photoAnalyses: settings.photoAnalyses,
        existingArt: settings.existingArt,
        artForms: settings.artForms,
        capabilities: settings.capabilities,
      };
      fetchRecommendations({
        settings: {
          llm: settings.llm,
          prompts: settings.prompts,
          style: settings.style,
          capabilities: settings.capabilities,
        },
        context: ctx,
      })
        .then((r) => {
          setRecs(r.data);
          setJuniState("recommendations_ready");
        })
        .catch(() => setJuniState("recommendations_ready"));
    }, 100);
  }

  function buildBrief() {
    if (!selectedRec) return;
    const b = buildMockBrief({
      memory,
      rec: selectedRec,
      artForms: settings.artForms,
      followupAnswer: followupAnswer ?? "",
      movieControls,
    });
    setBrief(b);
    setDebug({ lastBrief: b });
    setJuniState("brief_ready");
  }

  function confirmCreate() {
    if (!selectedRec) return;
    const b = buildMockBrief({
      memory,
      rec: selectedRec,
      artForms: settings.artForms,
      followupAnswer: followupAnswer ?? "Surprise me",
      movieControls,
    });
    onConfirmBrief(b);
  }

  function submitFreeform() {
    const text = freeform.trim();
    if (!text) return;
    const fakeRec: JuniRecommendation = {
      id: "rec-custom",
      artform: "genArt",
      title: "Your custom idea",
      description: text,
      why: "Built from what you described.",
      suggestedTemplateId:
        settings.artForms.find((a) => a.artform === "genArt")?.id ?? null,
      followupQuestion: {
        question: "What feeling should this lean into?",
        chips: ["Quiet and editorial", "Warm and soft", "Nostalgic", "Surprise me"],
      },
    };
    setRecs(
      recs
        ? { ...recs, recommendations: [fakeRec, ...recs.recommendations] }
        : {
            openingMessage: "Got it — here's where I'd take that.",
            memoryRead: {
              emotionalTone: [],
              specificDetails: [],
              alreadyCovered: [],
              creativeOpportunities: [],
            },
            recommendations: [fakeRec],
          }
    );
    setSelectedRec(fakeRec.id);
    setJuniState("concept_selected");
    setFreeform("");
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col">
      {/* Backdrop */}
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="mt-auto relative h-[88%] bg-paper-cream rounded-t-3xl shadow-sheet animate-slide-up flex flex-col">
        <div className="pt-2 pb-1 flex flex-col items-center">
          <div className="w-10 h-1 rounded-full bg-ink-100" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-juni text-white grid place-items-center text-[13px] font-bold">
              J
            </div>
            <div>
              <div className="text-[13px] font-semibold text-ink-900 leading-tight">
                Juni
              </div>
              <div className="text-[10px] text-ink-500 leading-tight">
                Memory creative assistant
              </div>
            </div>
          </div>
          <div className="text-[10px] text-ink-500 bg-white px-2.5 py-1 rounded-full border border-ink-100">
            {settings.generation.creationsLeft} creations left
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 scroll-area px-5 pb-3">
          <JuniBody
            state={juniState}
            error={error}
            recs={recs}
            selectedRec={selectedRec}
            followupAnswer={followupAnswer}
            settings={settings}
            onPickRec={pickRec}
            onAnswerFollowup={answerFollowup}
            onMoreIdeas={moreIdeas}
            onBuildBrief={buildBrief}
            onConfirmCreate={confirmCreate}
            onChangeDirection={() => {
              setSelectedRec(null);
              setFollowupAnswer(null);
              setBrief(null);
              setJuniState("recommendations_ready");
            }}
            movieControls={movieControls}
            setMovieControls={setMovieControls}
          />
        </div>

        {/* Sticky input */}
        <div className="border-t border-ink-100/70 bg-paper-cream/95 backdrop-blur px-3 py-2.5">
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-card">
            <input
              value={freeform}
              onChange={(e) => setFreeform(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitFreeform();
              }}
              placeholder="Or describe anything..."
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-ink-300 text-ink-900"
            />
            <button
              aria-label="Microphone"
              className="w-8 h-8 rounded-full grid place-items-center text-ink-500 hover:bg-black/5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect
                  x="9"
                  y="3"
                  width="6"
                  height="12"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M5 11a7 7 0 0014 0M12 18v3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={submitFreeform}
              disabled={!freeform.trim()}
              className="w-8 h-8 rounded-full grid place-items-center bg-juni text-white disabled:opacity-40"
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
    </div>
  );
}

function JuniBody(props: {
  state: ReturnType<typeof useAppStore.getState>["juniState"];
  error: string | null;
  recs: ReturnType<typeof useAppStore.getState>["recommendations"];
  selectedRec: JuniRecommendation | undefined;
  followupAnswer: string | null;
  settings: ReturnType<typeof useAppStore.getState>["settings"];
  onPickRec: (id: string) => void;
  onAnswerFollowup: (chip: string) => void;
  onMoreIdeas: () => void;
  onBuildBrief: () => void;
  onConfirmCreate: () => void;
  onChangeDirection: () => void;
  movieControls: MovieControls | undefined;
  setMovieControls: (m: MovieControls | undefined) => void;
}) {
  const {
    state,
    error,
    recs,
    selectedRec,
    followupAnswer,
    settings,
    onPickRec,
    onAnswerFollowup,
    onMoreIdeas,
    onBuildBrief,
    onConfirmCreate,
    onChangeDirection,
    movieControls,
    setMovieControls,
  } = props;

  if (state === "recommendations_loading") {
    return <ThinkingBubble label="Juni is reading your memory…" />;
  }

  if (error) {
    return (
      <JuniBubble>
        <p className="text-[14px] text-ink-900">
          Hmm — I couldn't reach my brain. Try again or switch to mock mode in
          Settings.
        </p>
        <div className="mt-1 text-[11px] text-ink-500">{error}</div>
      </JuniBubble>
    );
  }

  if (!recs) return null;

  return (
    <div className="space-y-5">
      <RecommendationsView
        key={`opening-${recs.openingMessage}`}
        recs={recs}
        state={state}
        selectedRec={selectedRec}
        settings={settings}
        onPickRec={onPickRec}
        onMoreIdeas={onMoreIdeas}
      />

      {selectedRec &&
        (state === "concept_selected" || state === "followup_answered") &&
        selectedRec.artform === "genArt" && (
          <FollowupBlock
            selectedRec={selectedRec}
            followupAnswer={followupAnswer}
            onAnswer={onAnswerFollowup}
            onBuildBrief={onBuildBrief}
            artFormName={
              settings.artForms.find(
                (t) => t.id === selectedRec.suggestedTemplateId
              )?.name
            }
          />
        )}

      {selectedRec &&
        (state === "concept_selected" || state === "followup_answered") &&
        selectedRec.artform === "movie" && (
          <MoviePathPanel
            memory={settings.memory!}
            hasPeople={false}
            onConfirm={(controls) => {
              setMovieControls(controls);
              onAnswerFollowup(`movie:${controls.theme}:${controls.length}`);
              setTimeout(() => onBuildBrief(), 50);
            }}
            onCancel={onChangeDirection}
          />
        )}

      {state === "brief_ready" && useAppStore.getState().brief && (
        <CreativeBriefCard
          brief={useAppStore.getState().brief!}
          onConfirm={onConfirmCreate}
          onChangeDirection={onChangeDirection}
        />
      )}
    </div>
  );
}

function RecommendationsView({
  recs,
  state,
  selectedRec,
  settings,
  onPickRec,
  onMoreIdeas,
}: {
  recs: NonNullable<ReturnType<typeof useAppStore.getState>["recommendations"]>;
  state: ReturnType<typeof useAppStore.getState>["juniState"];
  selectedRec: JuniRecommendation | undefined;
  settings: ReturnType<typeof useAppStore.getState>["settings"];
  onPickRec: (id: string) => void;
  onMoreIdeas: () => void;
}) {
  const [openingTyped, setOpeningTyped] = useState(false);
  const [cardsRevealed, setCardsRevealed] = useState(false);

  // After cards animate in, wait a beat then reveal the nudge so it lands
  // as a separate chat turn rather than all at once.
  useEffect(() => {
    if (!openingTyped) return;
    const t = setTimeout(() => setCardsRevealed(true), 650);
    return () => clearTimeout(t);
  }, [openingTyped]);

  const showCards = openingTyped && state !== "brief_ready";
  const showNudge =
    cardsRevealed &&
    state === "recommendations_ready" &&
    !selectedRec;

  return (
    <div className="space-y-3">
      <JuniBubble>
        <p className="text-[14px] leading-relaxed text-ink-900">
          <TypewriterText
            text={recs.openingMessage}
            speedMs={12}
            onDone={() => setOpeningTyped(true)}
          />
        </p>
        {openingTyped && recs.memoryRead.alreadyCovered.length > 0 && (
          <div className="mt-3 text-[11px] text-ink-500 animate-fade-in">
            <span className="font-semibold text-ink-700">Already covered:</span>{" "}
            {recs.memoryRead.alreadyCovered.join(", ")}
          </div>
        )}
      </JuniBubble>

      {showCards && (
        <div className="pl-9 animate-slide-up">
          <div className="flex items-baseline justify-between mb-1.5">
            <h3 className="text-[10px] uppercase tracking-widest text-ink-500 font-semibold">
              {recs.recommendations.length} ideas
            </h3>
            <button
              onClick={onMoreIdeas}
              className="text-[10px] text-juni font-medium"
            >
              More ideas...
            </button>
          </div>
          <RecommendationCards
            recs={recs.recommendations}
            artForms={settings.artForms}
            selectedId={selectedRec?.id ?? null}
            onSelect={onPickRec}
            coverPhotoDataUrl={pickCoverPhoto(settings)}
          />
        </div>
      )}

      {showNudge && <NudgeBubble />}
    </div>
  );
}

function pickCoverPhoto(
  settings: ReturnType<typeof useAppStore.getState>["settings"]
): string | null {
  const coverId = settings.memory?.cover_photo_id;
  if (coverId) {
    const match = settings.photoAnalyses.find(
      (p) => p.photo_id === coverId && !!p.imageDataUrl
    );
    if (match?.imageDataUrl) return match.imageDataUrl;
  }
  const first = settings.photoAnalyses.find((p) => !!p.imageDataUrl);
  return first?.imageDataUrl ?? null;
}

function NudgeBubble() {
  return (
    <div className="animate-fade-in">
      <JuniBubble>
        <p className="text-[13px] leading-relaxed text-ink-900">
          <TypewriterText
            text="Tap one to dig into it — or just tell me what you actually want and I'll build from that."
            speedMs={10}
          />
        </p>
      </JuniBubble>
    </div>
  );
}

function JuniBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 items-start animate-fade-in">
      <div className="w-7 h-7 shrink-0 rounded-full bg-juni text-white grid place-items-center text-[12px] font-bold shadow-card">
        J
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-md bg-white shadow-card p-4">
        {children}
      </div>
    </div>
  );
}

function ThinkingBubble({ label }: { label: string }) {
  return (
    <div className="flex gap-2.5 items-start animate-fade-in">
      <div className="w-7 h-7 shrink-0 rounded-full bg-juni text-white grid place-items-center text-[12px] font-bold shadow-card animate-pulse-soft">
        J
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-md bg-white shadow-card px-4 py-3.5">
        <ThinkingDots label={label} />
      </div>
    </div>
  );
}

function FollowupBlock(props: {
  selectedRec: JuniRecommendation;
  followupAnswer: string | null;
  onAnswer: (chip: string) => void;
  onBuildBrief: () => void;
  artFormName?: string;
}) {
  const { selectedRec, followupAnswer, onAnswer, onBuildBrief, artFormName } =
    props;
  const [thinking, setThinking] = useState(true);
  const [typed, setTyped] = useState(false);

  useEffect(() => {
    setThinking(true);
    setTyped(false);
    const t = setTimeout(() => setThinking(false), 700);
    return () => clearTimeout(t);
  }, [selectedRec.id]);

  return (
    <div className="space-y-3 animate-slide-up">
      <div className="flex gap-2.5 items-start">
        <div className="w-7 h-7 shrink-0 rounded-full bg-juni text-white grid place-items-center text-[12px] font-bold shadow-card">
          J
        </div>
        <div className="flex-1 rounded-2xl rounded-tl-md bg-juni-soft p-4">
          <div className="text-[11px] uppercase tracking-widest text-juni-ink font-semibold mb-1.5">
            One quick question
          </div>
          {thinking ? (
            <ThinkingDots />
          ) : (
            <p className="text-[14px] leading-relaxed text-juni-ink">
              <TypewriterText
                text={selectedRec.followupQuestion.question}
                speedMs={14}
                onDone={() => setTyped(true)}
              />
            </p>
          )}
          {typed && artFormName && (
            <div className="mt-2 text-[11px] text-juni-ink/70 animate-fade-in">
              Building on the{" "}
              <span className="font-semibold">{artFormName}</span> template.
            </div>
          )}
        </div>
      </div>
      {typed && (
        <div className="animate-fade-in">
          <Chips
            chips={selectedRec.followupQuestion.chips}
            selected={followupAnswer}
            onSelect={onAnswer}
          />
        </div>
      )}
      {followupAnswer && (
        <button
          onClick={onBuildBrief}
          className="w-full rounded-full py-3 text-[13px] font-semibold text-white bg-juni active:scale-[0.99] animate-fade-in"
        >
          Continue
        </button>
      )}
    </div>
  );
}
