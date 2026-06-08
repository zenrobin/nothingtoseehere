"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DeviceFrame } from "@/components/DeviceFrame";
import { MemoryDetail } from "@/components/MemoryDetail";
import { JuniSheet } from "@/components/JuniSheet";
import { GenerationToast } from "@/components/GenerationToast";
import { DebugFab, DebugPanel } from "@/components/DebugPanel";
import { ResultDetail } from "@/components/ResultDetail";
import { Gallery } from "@/components/Gallery";
import { SetupScreen } from "@/components/SetupScreen";
import { useAppStore } from "@/lib/store";
import type { CreativeBrief, GenerationJob, ExistingArt } from "@/types";
import { startGenerationJob } from "@/lib/mockGeneration";
import { loggedFetchRecommendations } from "@/lib/llmCalls";

export default function Page() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  // Migrate any pre-existing "mock" provider in localStorage to anthropic.
  // Mock is no longer a supported option.
  useEffect(() => {
    if (!hydrated) return;
    if ((settings.llm.provider as string) === "mock") {
      setSettings((s) => ({
        ...s,
        llm: { ...s.llm, provider: "anthropic" },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);
  const juniOpen = useAppStore((s) => s.juniOpen);
  const openJuni = useAppStore((s) => s.openJuni);
  const closeJuni = useAppStore((s) => s.closeJuni);
  const upsertJob = useAppStore((s) => s.upsertJob);
  const activeJob = useAppStore((s) => s.activeJob);
  const setActiveJob = useAppStore((s) => s.setActiveJob);
  const setJuniState = useAppStore((s) => s.setJuniState);
  const setRecs = useAppStore((s) => s.setRecommendations);
  const setSelectedRec = useAppStore((s) => s.setSelectedRec);
  const setFollowupAnswer = useAppStore((s) => s.setFollowupAnswer);
  const setBrief = useAppStore((s) => s.setBrief);
  const recs = useAppStore((s) => s.recommendations);
  const setDebug = useAppStore((s) => s.setDebug);
  const decrementCreations = useAppStore((s) => s.decrementCreations);
  const addExistingArt = useAppStore((s) => s.addExistingArt);
  const toast = useAppStore((s) => s.toast);
  const setToast = useAppStore((s) => s.setToast);

  const [showResult, setShowResult] = useState<GenerationJob | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const movedToArtRef = useRef<string | null>(null);
  const prefetchedForRef = useRef<string | null>(null);

  // Prefetch recommendations as soon as a memory is loaded so opening the
  // Juni sheet feels instant. The same prefetch is invalidated when the
  // memory changes (loadMemoryFromZip nulls recommendations).
  useEffect(() => {
    if (!hydrated || !hasOnboarded || !settings.memory || juniOpen) return;
    if (recs) {
      prefetchedForRef.current = settings.memory.id;
      return;
    }
    if (prefetchedForRef.current === settings.memory.id) return;
    prefetchedForRef.current = settings.memory.id;

    const ctx = {
      memory: settings.memory,
      photoAnalyses: settings.photoAnalyses,
      existingArt: settings.existingArt,
      artForms: settings.artForms,
      capabilities: settings.capabilities,
    };
    loggedFetchRecommendations("page-prefetch", {
      settings: {
        llm: settings.llm,
        prompts: settings.prompts,
        style: settings.style,
        capabilities: settings.capabilities,
      },
      context: ctx,
    })
      .then((resp) => {
        if (!resp) return;
        setRecs(resp.data);
        setDebug({
          lastContext: ctx,
          lastRequest: resp.debug.request,
          lastResponse: resp.debug.response,
        });
      })
      .catch((e) => {
        console.warn("recommendation prefetch failed", e);
        prefetchedForRef.current = null; // allow retry on next open
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, hasOnboarded, settings.memory?.id, recs]);

  const pendingJob =
    activeJob && activeJob.status === "pending" ? activeJob : null;
  const completedJob =
    activeJob && activeJob.status === "complete" ? activeJob : null;

  function startCreate() {
    if (!settings.memory) return;
    if (settings.generation.creationsLeft <= 0) {
      setToast({ title: "Out of creations", subtitle: "Adjust in Settings" });
      setTimeout(() => setToast(null), 2400);
      return;
    }
    // reset prior creation state
    setRecs(null);
    setSelectedRec(null);
    setFollowupAnswer(null);
    setBrief(null);
    openJuni();
  }

  function handleConfirmBrief(brief: CreativeBrief) {
    if (!settings.memory) return;
    closeJuni();
    decrementCreations();
    setToast({
      title: "Your art is on the way",
      subtitle: "Usually it takes up to 30 sec to finish.",
    });
    movedToArtRef.current = null;
    startGenerationJob({
      memoryId: settings.memory.id,
      brief,
      delayMs: settings.generation.delayMs,
      failureRatePct: settings.generation.failureRatePct,
      onUpdate: (job) => {
        upsertJob(job);
        if (job.status === "complete") {
          setJuniState("generated");
          setToast({
            title: "Your art is ready",
            subtitle: `Tap "${job.brief.conceptTitle}" to view`,
          });
          setTimeout(() => setToast(null), 3200);
        } else if (job.status === "failed") {
          setJuniState("generation_failed");
          setToast({
            title: "Generation failed",
            subtitle: "Try again — Juni will pick a slightly different path.",
          });
          setTimeout(() => setToast(null), 3200);
        } else {
          setJuniState("generating");
        }
      },
    });
  }

  // When a completed job is acknowledged via tapping, move it into existing art
  // so subsequent flows treat it as part of the collection.
  function persistResultAsArt(job: GenerationJob) {
    if (!job.result) return;
    if (movedToArtRef.current === job.id) return;
    movedToArtRef.current = job.id;
    const art: ExistingArt = {
      id: `art-from-${job.id}`,
      memoryId: job.memoryId,
      kind: job.result.kind,
      title: job.result.title,
      subtitle: "Made by Juni",
      thumbColor: job.result.thumbGradient,
      createdAt: new Date(job.completedAt ?? Date.now()).toISOString(),
    };
    addExistingArt(art);
    setActiveJob(null);
  }

  if (!hydrated || !settings.memory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DeviceFrame>
          <div className="p-6 text-[13px] text-ink-500">Loading prototype…</div>
        </DeviceFrame>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center">
      <DeviceFrame>
        <MemoryDetail
          memory={settings.memory}
          photoAnalyses={settings.photoAnalyses}
          existingArt={settings.existingArt}
          pendingJob={pendingJob}
          completedJob={completedJob}
          creationsLeft={settings.generation.creationsLeft}
          onCreate={startCreate}
          onGallery={() => setShowGallery(true)}
          onSettings={() => router.push("/settings")}
          onChangeMemory={() => setOnboarded(false)}
          onResultTap={(job) => setShowResult(job)}
        />

        {juniOpen && (
          <JuniSheet
            onConfirmBrief={handleConfirmBrief}
            onClose={closeJuni}
          />
        )}

        {showResult && (
          <ResultDetail
            job={showResult}
            onClose={() => {
              persistResultAsArt(showResult);
              setShowResult(null);
            }}
            onMakeAnother={() => {
              persistResultAsArt(showResult);
              setShowResult(null);
              startCreate();
            }}
            onMakeMore={() => {
              persistResultAsArt(showResult);
              setShowResult(null);
              startCreate();
            }}
            onTryMovie={() => {
              persistResultAsArt(showResult);
              setShowResult(null);
              startCreate();
            }}
          />
        )}

        {showGallery && (
          <Gallery
            onClose={() => setShowGallery(false)}
            onStartCreate={() => {
              setShowGallery(false);
              startCreate();
            }}
          />
        )}

        {toast && (
          <GenerationToast
            title={toast.title}
            subtitle={toast.subtitle}
            onDismiss={() => setToast(null)}
          />
        )}

        {!hasOnboarded && (
          <SetupScreen onDone={() => setOnboarded(true)} />
        )}

        <DebugFab />
        <DebugPanel />
      </DeviceFrame>
    </div>
  );
}
