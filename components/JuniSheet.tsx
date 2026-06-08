"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { loggedFetchRecommendations } from "@/lib/llmCalls";
import type {
  CreativeBrief as CreativeBriefT,
  JuniRecommendation,
  MovieControls,
} from "@/types";
import { Chips } from "./Chips";
import { RecommendationCards, getCardImage } from "./RecommendationCards";
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
  const [userSaid, setUserSaid] = useState<string | null>(null);
  const [movieControls, setMovieControls] = useState<MovieControls | undefined>(
    undefined
  );
  const [movieIntroTyped, setMovieIntroTyped] = useState(false);
  const [theme, setTheme] = useState<MovieControls["theme"]>("elegant");
  const [length, setLength] = useState<MovieControls["length"]>("shorter");
  const [textDensity, setTextDensity] = useState<MovieControls["textDensity"]>("less");
  const [feature, setFeature] = useState<string>("Let Juni choose");

  const memory = settings.memory!;
  const selectedRec: JuniRecommendation | undefined = useMemo(
    () => recs?.recommendations.find((r) => r.id === selectedRecId),
    [recs, selectedRecId]
  );

  // Load recommendations on open. If a prefetch (either on Setup commit
  // or by the page-level effect) already filled them in, transition
  // straight to ready — no fetch, no artificial beat. Only fall back to
  // a real fetch (and a real thinking bubble) when nothing is cached.
  useEffect(() => {
    if (recs) {
      // Record a "skipped" entry so the debug panel makes it obvious that
      // opening the sheet did NOT trigger another LLM call.
      useAppStore.getState().recordLLMCall({
        id: `llm-${Date.now()}-skip`,
        source: "sheet-mount-fetch",
        startedAt: Date.now(),
        endedAt: Date.now(),
        durationMs: 0,
        status: "skipped",
        reason: "recs already cached on sheet mount",
      });
      setJuniState("recommendations_ready");
      return;
    }
    let cancelled = false;
    async function load() {
      setJuniState("recommendations_loading");
      try {
        const ctx = {
          memory,
          photoAnalyses: settings.photoAnalyses,
          existingArt: settings.existingArt,
          artForms: settings.artForms,
          capabilities: settings.capabilities,
        };
        const resp = await loggedFetchRecommendations("sheet-mount-fetch", {
          settings: {
            llm: settings.llm,
            prompts: settings.prompts,
            style: settings.style,
            capabilities: settings.capabilities,
          },
          context: ctx,
        });
        if (cancelled || !resp) return;
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
    setBrief(null);
    setMovieControls(undefined);
    setJuniState("concept_selected");
    setMovieIntroTyped(false);
    setTheme("elegant");
    setLength("shorter");
    setTextDensity("less");
    setFeature("Let Juni choose");
  }

  function answerFollowup(chip: string) {
    setFollowupAnswer(chip);
    setJuniState("followup_answered");
  }

  async function moreIdeas() {
    const previousTitles = recs?.recommendations.map((r) => r.title) ?? [];
    setSelectedRec(null);
    setFollowupAnswer(null);
    setJuniState("recommendations_loading");
    try {
      const ctx = {
        memory,
        photoAnalyses: settings.photoAnalyses,
        existingArt: settings.existingArt,
        artForms: settings.artForms,
        capabilities: settings.capabilities,
      };
      const r = await loggedFetchRecommendations("more-ideas", {
        settings: {
          llm: settings.llm,
          prompts: settings.prompts,
          style: settings.style,
          capabilities: settings.capabilities,
        },
        context: ctx,
        conversation: {
          moreIdeas: true,
          excludeTitles: previousTitles,
        },
      });
      if (!r) return;
      setRecs(r.data);
      setJuniState("recommendations_ready");
    } catch (e: any) {
      setError(e?.message ?? "Failed to load more ideas");
      setJuniState("recommendations_ready");
    }
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

  function confirmMovieSettings() {
    setMovieControls({ theme, length, textDensity, feature });
    answerFollowup(`movie:${theme}:${length}`);
    setTimeout(() => {
      buildBrief();
      setMovieIntroTyped(false);
    }, 50);
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

  async function submitFreeform() {
    const text = freeform.trim();
    if (!text) return;
    setFreeform("");
    setUserSaid(text);
    setSelectedRec(null);
    setFollowupAnswer(null);
    setJuniState("recommendations_loading");
    try {
      const ctx = {
        memory,
        photoAnalyses: settings.photoAnalyses,
        existingArt: settings.existingArt,
        artForms: settings.artForms,
        capabilities: settings.capabilities,
      };
      const r = await loggedFetchRecommendations("freeform", {
        settings: {
          llm: settings.llm,
          prompts: settings.prompts,
          style: settings.style,
          capabilities: settings.capabilities,
        },
        context: ctx,
        conversation: {
          userMessage: text,
        },
      });
      if (!r) return;
      setRecs(r.data);
      setJuniState("recommendations_ready");
    } catch (e: any) {
      setError(e?.message ?? "Failed to respond to your message");
      setJuniState("recommendations_ready");
    }
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
      <div className="mt-auto relative h-[calc(100%-64px)] bg-white rounded-t-3xl shadow-sheet animate-slide-up flex flex-col">
         {/* iOS Visual Header Container with white BG, bottom divider, and shadow */}
        <div className="h-16 bg-white rounded-t-3xl shadow-md border-b border-ink-100/60 relative flex items-center z-10 select-none">
          {/* Absolute Drag Handle */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2">
            <div className="w-9 h-1 rounded-full bg-ink-200" />
          </div>

          {/* Header Content */}
          <div className="w-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-juni text-white grid place-items-center text-[13px] font-bold shadow-sm">
                J
              </div>
              <div>
                <div className="text-[13px] font-semibold text-ink-900 leading-none mb-0.5">
                  Juni
                </div>
                <div className="text-[10px] text-ink-500 leading-none">
                  Memory creative assistant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[10px] text-orange-700 bg-orange-50/70 px-2.5 py-1 rounded-full border border-orange-100 font-medium">
                {settings.generation.creationsLeft} creations left
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-ink-100/50 hover:bg-ink-100/80 text-ink-600 flex items-center justify-center transition active:scale-95"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 scroll-area no-scrollbar px-4 pt-3 pb-3 select-none">
          <JuniBody
            state={juniState}
            error={error}
            recs={recs}
            selectedRec={selectedRec}
            followupAnswer={followupAnswer}
            settings={settings}
            userSaid={userSaid}
            onPickRec={pickRec}
            onAnswerFollowup={answerFollowup}
            onMoreIdeas={moreIdeas}
            onBuildBrief={buildBrief}
            onConfirmCreate={confirmCreate}
            onChangeDirection={() => {
              setSelectedRec(null);
              setFollowupAnswer(null);
              setBrief(null);
              setUserSaid(null);
              setJuniState("recommendations_ready");
              setMovieIntroTyped(false);
            }}
            movieControls={movieControls}
            setMovieControls={setMovieControls}
            
            // Movie inline customizer props
            movieIntroTyped={movieIntroTyped}
            onMovieIntroDone={() => setMovieIntroTyped(true)}
            theme={theme}
            setTheme={setTheme}
            length={length}
            setLength={setLength}
            textDensity={textDensity}
            setTextDensity={setTextDensity}
            feature={feature}
            setFeature={setFeature}
            onConfirmMovieSettings={confirmMovieSettings}
          />
        </div>

        {/* Sticky input */}
        <div className="border-t border-ink-100/70 bg-white/95 backdrop-blur px-3 py-2.5">
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

        {/* Absolute bottom sheet removed in favor of inline customization */}
      </div>
    </div>
  );
}

interface UserBubbleProps {
  children: React.ReactNode;
  image?: string;
}

function UserBubble({ children, image }: UserBubbleProps) {
  return (
    <div className="flex items-center justify-end gap-3 animate-fade-in pl-10 my-1">
      <div className={`rounded-2xl bg-[#F8F7F3] text-ink-900 px-4 py-2.5 text-[14px] leading-relaxed text-left font-normal ${
        image ? "max-w-[calc(100%-60px)]" : "max-w-[85%]"
      }`}>
        {children}
      </div>
      {image && (
        <img
          src={image}
          alt=""
          className="w-12 h-16 object-cover rounded-lg shadow-md border border-white/80 shrink-0 select-none animate-fade-in"
        />
      )}
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
  userSaid: string | null;
  onPickRec: (id: string) => void;
  onAnswerFollowup: (chip: string) => void;
  onMoreIdeas: () => void;
  onBuildBrief: () => void;
  onConfirmCreate: () => void;
  onChangeDirection: () => void;
  movieControls: MovieControls | undefined;
  setMovieControls: (m: MovieControls | undefined) => void;
  
  // Movie inline states
  movieIntroTyped: boolean;
  onMovieIntroDone: () => void;
  theme: MovieControls["theme"];
  setTheme: (t: MovieControls["theme"]) => void;
  length: MovieControls["length"];
  setLength: (l: MovieControls["length"]) => void;
  textDensity: MovieControls["textDensity"];
  setTextDensity: (d: MovieControls["textDensity"]) => void;
  feature: string;
  setFeature: (f: string) => void;
  onConfirmMovieSettings: () => void;
}) {
  const {
    state,
    error,
    recs,
    selectedRec,
    followupAnswer,
    settings,
    userSaid: _userSaid,
    onPickRec,
    onAnswerFollowup,
    onMoreIdeas,
    onBuildBrief,
    onConfirmCreate,
    onChangeDirection,
    movieControls,
    setMovieControls,
    movieIntroTyped,
    onMovieIntroDone,
    theme,
    setTheme,
    length,
    setLength,
    textDensity,
    setTextDensity,
    feature,
    setFeature,
    onConfirmMovieSettings,
  } = props;

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Automatically scroll the parent scroll area to the bottom in real-time
  // as the content grows (e.g., during typewriter typing).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(() => {
      parent.scrollTop = parent.scrollHeight;
      requestAnimationFrame(() => {
        parent.scrollTop = parent.scrollHeight;
      });
      // Fallback delay to ensure it catches absolute final paint & layout settles
      setTimeout(() => {
        parent.scrollTop = parent.scrollHeight;
      }, 100);
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [state, selectedRec?.id, followupAnswer, recs]);

  const userSaidNode = _userSaid ? (
    <UserBubble>{_userSaid}</UserBubble>
  ) : null;
  const thinkingLabel = _userSaid ? "Thinking…" : "Juni is reading your memory…";

  if (state === "recommendations_loading") {
    return (
      <div ref={containerRef}>
        {userSaidNode}
        <ThinkingBubble label={thinkingLabel} />
      </div>
    );
  }

  if (error) {
    const isRateLimit =
      /rate[_ -]?limit|429|tokens per minute/i.test(error);
    return (
      <div ref={containerRef}>
        {userSaidNode}
        <JuniBubble>
          {isRateLimit ? (
            <p className="text-[14px] text-ink-900">
              I&apos;ve hit the Anthropic per-minute token limit on this account.
              Wait about a minute and try again, or bump the plan&apos;s
              tier at{" "}
              <a
                href="https://console.anthropic.com/settings/limits"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-juni"
              >
                console.anthropic.com/settings/limits
              </a>
              .
            </p>
          ) : (
            <p className="text-[14px] text-ink-900">
              Hmm — I can&apos;t reach my brain right now. Check that
              <code className="mx-1 px-1 py-0.5 rounded bg-ink-100 text-[12px]">
                ANTHROPIC_API_KEY
              </code>
              is set in your environment, then try again.
            </p>
          )}
          <div className="mt-2 text-[11px] text-ink-500 leading-snug break-words">
            {error}
          </div>
        </JuniBubble>
      </div>
    );
  }

  if (!recs) return null;

  return (
    <div ref={containerRef} className="space-y-5 pb-1">
      {userSaidNode}

      {/* 1. Juni's opening message and recommended cards */}
      <RecommendationsView
        key={`opening-${recs.openingMessage}`}
        recs={recs}
        state={state}
        selectedRec={selectedRec}
        settings={settings}
        onPickRec={onPickRec}
        onMoreIdeas={onMoreIdeas}
      />

      {/* 2. User Bubble showing selected concept */}
      {selectedRec && (
        <UserBubble image={getCardImage(selectedRec, settings.photoAnalyses, pickCoverPhoto(settings))}>
          Let's go with the <span className="font-semibold">"{selectedRec.title}"</span> concept.
        </UserBubble>
      )}

      {/* 2b. Movie introduction bubble and settings block from Juni */}
      {selectedRec && selectedRec.artform === "movie" && (
        <div className="flex flex-col gap-3">
          <JuniBubble>
            {!followupAnswer ? (
              <TypewriterText
                text="I'd make a 30-second movie — three details, three title cards, solo piano. Or a longer, more elegant version that pulls in the whole façade. Pick how it should feel."
                speedMs={10}
                onDone={onMovieIntroDone}
              />
            ) : (
              "I'd make a 30-second movie — three details, three title cards, solo piano. Or a longer, more elegant version that pulls in the whole façade. Pick how it should feel."
            )}
          </JuniBubble>

          {/* 2c. Inline Customization Modal */}
          {(!followupAnswer || state === "concept_selected") && movieIntroTyped && (
            <>
              <div className="animate-slide-up pl-10.5 pr-0 select-none w-full">
                <div className="bg-[#F8F7F3] border border-ink-200/30 rounded-[28px] p-4 flex flex-col w-full">
                  {/* Segmented Controls settings */}
                  <MoviePathPanel
                    memory={settings.memory!}
                    hasPeople={false}
                    theme={theme}
                    setTheme={setTheme}
                    length={length}
                    setLength={setLength}
                    textDensity={textDensity}
                    setTextDensity={setTextDensity}
                    feature={feature}
                    setFeature={setFeature}
                  />
                </div>
              </div>

              {/* Bottom Purple Submit Button */}
              <div className="pt-1 flex justify-center animate-slide-up pl-10.5 pr-0 w-full">
                <button
                  onClick={onConfirmMovieSettings}
                  className="h-[42px] px-8 rounded-full text-[13px] font-semibold text-white bg-juni hover:bg-juni-dark active:scale-[0.98] transition flex items-center justify-center shadow-sm"
                >
                  Use these settings
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 3. Juni's Follow-up Question Block */}
      {selectedRec && selectedRec.artform === "genArt" && (
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

      {/* 4. User Bubble showing GenArt Follow-up Answer */}
      {selectedRec && selectedRec.artform === "genArt" && followupAnswer && (
        <UserBubble>
          {followupAnswer}
        </UserBubble>
      )}

      {/* 5. Finalized Movie Selection User Bubble in chat */}
      {selectedRec && selectedRec.artform === "movie" && followupAnswer && movieControls && (
        <UserBubble>
          Theme: <span className="font-semibold capitalize">{movieControls.theme}</span>,{" "}
          Length: <span className="font-semibold capitalize">{movieControls.length}</span>
        </UserBubble>
      )}

      {/* 6. Creative Brief Card */}
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
  const [openingTyped, setOpeningTyped] = useState(!!selectedRec);
  const [cardsRevealed, setCardsRevealed] = useState(!!selectedRec);

  useEffect(() => {
    if (selectedRec) {
      setOpeningTyped(true);
      setCardsRevealed(true);
    }
  }, [selectedRec]);

  // After cards animate in, wait a beat then reveal the nudge so it lands
  // as a separate chat turn rather than all at once.
  useEffect(() => {
    if (selectedRec) return;
    if (!openingTyped) return;
    const t = setTimeout(() => setCardsRevealed(true), 650);
    return () => clearTimeout(t);
  }, [openingTyped, selectedRec]);

  const showCards = openingTyped && !selectedRec;
  const showNudge =
    cardsRevealed &&
    state === "recommendations_ready" &&
    !selectedRec;

  return (
    <div className="space-y-1.5">
      <JuniBubble>
        <p className="text-[14px] leading-relaxed text-ink-900">
          {selectedRec ? (
            recs.openingMessage
          ) : (
            <TypewriterText
              text={recs.openingMessage}
              speedMs={12}
              onDone={() => setOpeningTyped(true)}
            />
          )}
        </p>
        {openingTyped && recs.memoryRead.alreadyCovered.length > 0 && (
          <div className="mt-3 text-[11px] text-ink-500 animate-fade-in">
            <span className="font-semibold text-ink-700">Already covered:</span>{" "}
            {recs.memoryRead.alreadyCovered.join(", ")}
          </div>
        )}
      </JuniBubble>

      {showCards && (
        <div className="animate-slide-up">
          <RecommendationCards
            recs={recs.recommendations}
            artForms={settings.artForms}
            selectedId={null}
            onSelect={onPickRec}
            photoAnalyses={settings.photoAnalyses}
            coverPhotoDataUrl={pickCoverPhoto(settings)}
            onMoreIdeas={onMoreIdeas}
          />
        </div>
      )}
    </div>
  );
}

function pickCoverPhoto(
  settings: ReturnType<typeof useAppStore.getState>["settings"]
): string {
  const coverId = settings.memory?.cover_photo_id;
  if (coverId) {
    const match = settings.photoAnalyses.find(
      (p) => p.photo_id === coverId && !!p.imageDataUrl
    );
    if (match?.imageDataUrl) return match.imageDataUrl;
  }
  const first = settings.photoAnalyses.find((p) => !!p.imageDataUrl);
  if (first?.imageDataUrl) return first.imageDataUrl;

  // Curated premium photography mapping (100% reliable Unsplash CDN)
  const title = (settings.memory?.snappy_title || "").toLowerCase();
  const summary = (settings.memory?.memory_summary || "").toLowerCase();

  // A. Island / Sunset / Beach theme
  if (title.includes("island") || title.includes("beach") || summary.includes("island") || summary.includes("sunset")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&h=300&q=80";
  }
  // B. House / Architecture facade
  if (title.includes("house") || title.includes("home") || summary.includes("house") || summary.includes("facade")) {
    return "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&h=300&q=80";
  }
  // C. Cozy entrance / steps / porch
  if (title.includes("bike") || title.includes("steps") || summary.includes("bicycle") || summary.includes("porch")) {
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&h=300&q=80";
  }

  // Fallback to active dynamic placeholder search (Flickr)
  const queryWords: string[] = [];
  if (settings.memory?.snappy_title) {
    settings.memory.snappy_title.split(" ").forEach((w) => {
      const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (clean && clean.length > 2) queryWords.push(clean);
    });
  }
  const query = queryWords.length > 0 ? queryWords.join(",") : "scenery,landscape";
  return `https://loremflickr.com/400/300/${query}`;
}



function JuniAvatar({ pulse }: { pulse?: boolean }) {
  return (
    <div
      className={`w-8 h-8 shrink-0 rounded-full bg-juni text-white grid place-items-center text-[12px] font-bold shadow-card ${
        pulse ? "animate-pulse-soft" : ""
      }`}
      aria-hidden
    >
      J
    </div>
  );
}

function JuniBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 animate-fade-in py-1 pr-10">
      <JuniAvatar />
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

function ThinkingBubble({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-2.5 animate-fade-in py-1 pr-10">
      <JuniAvatar pulse />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-juni font-semibold mb-1">
          Juni
        </div>
        <div className="rounded-2xl rounded-tl-md bg-white shadow-card px-4 py-3 inline-flex items-center">
          <ThinkingDots label={label} />
        </div>
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
  const [thinking, setThinking] = useState(!followupAnswer);
  const [typed, setTyped] = useState(!!followupAnswer);

  useEffect(() => {
    if (followupAnswer) {
      setThinking(false);
      setTyped(true);
      return;
    }
    setThinking(true);
    setTyped(false);
    const t = setTimeout(() => setThinking(false), 700);
    return () => clearTimeout(t);
  }, [selectedRec.id, followupAnswer]);

  return (
    <div className="space-y-3 animate-slide-up py-1">
      {thinking ? (
        <ThinkingBubble label="One quick question…" />
      ) : (
        <JuniBubble>
          {followupAnswer ? (
            selectedRec.followupQuestion.question
          ) : (
            <TypewriterText
              text={selectedRec.followupQuestion.question}
              speedMs={14}
              onDone={() => setTyped(true)}
            />
          )}
          {typed && artFormName && (
            <div className="text-[11.5px] text-ink-500 animate-fade-in mt-2">
              Building on the{" "}
              <span className="font-semibold text-ink-600">{artFormName}</span> template.
            </div>
          )}
        </JuniBubble>
      )}
      {typed && !followupAnswer && (
        <div className="pl-[42px] animate-fade-in">
          <Chips
            chips={selectedRec.followupQuestion.chips}
            selected={followupAnswer}
            onSelect={(chip) => {
              onAnswer(chip);
              setTimeout(() => {
                onBuildBrief();
              }, 50);
            }}
          />
        </div>
      )}
    </div>
  );
}
