"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppSettings,
  CreativeBrief,
  ExistingArt,
  GenerationJob,
  JuniRecommendationsResponse,
  JuniState,
  Memory,
  PhotoAnalysis,
} from "@/types";
import { DEFAULT_ART_FORMS } from "@/data/defaultArtForms";
import {
  DEFAULT_EXISTING_ART,
  DEFAULT_MEMORY,
  DEFAULT_PHOTO_ANALYSES,
} from "@/data/defaultMemory";
import {
  DEFAULT_RECOMMENDATION_PROMPT,
  DEFAULT_SYSTEM_PROMPT,
} from "@/lib/juniPrompts";

export const DEFAULT_SETTINGS: AppSettings = {
  llm: {
    provider: "anthropic",
    model: "claude-haiku-4-5-20251001",
    apiKey: "",
    temperature: 0.7,
    maxTokens: 1500,
    streaming: false,
    thinkingLevel: "medium",
  },
  prompts: {
    system: DEFAULT_SYSTEM_PROMPT,
    recommendation: DEFAULT_RECOMMENDATION_PROMPT,
  },
  style: {
    concise: 65,
    proactive: 70,
    magical: 55,
    askMore: 35,
  },
  capabilities: {
    genArt: true,
    movie: true,
    gallery: true,
    rawIdea: true,
    artForms: true,
    existingArtAwareness: true,
  },
  generation: {
    delayMs: 8000,
    failureRatePct: 0,
    creationsLeft: 4,
    returnInline: true,
  },
  artForms: DEFAULT_ART_FORMS,
  memory: DEFAULT_MEMORY,
  photoAnalyses: DEFAULT_PHOTO_ANALYSES,
  existingArt: DEFAULT_EXISTING_ART,
  debug: {
    devPersist: false,
  },
};

interface AppState {
  settings: AppSettings;
  hasOnboarded: boolean;
  juniState: JuniState;
  juniOpen: boolean;
  recommendations: JuniRecommendationsResponse | null;
  selectedRecId: string | null;
  followupAnswer: string | null;
  brief: CreativeBrief | null;
  activeJob: GenerationJob | null;
  jobs: GenerationJob[];
  toast: { title: string; subtitle?: string } | null;
  llmCalls: import("@/lib/llmCalls").LLMCallLog[];
  debugPanelOpen: boolean;

  setSettings: (updater: (s: AppSettings) => AppSettings) => void;
  resetSettings: () => void;
  loadMemoryFromZip: (args: {
    memory: Memory;
    photoAnalyses: PhotoAnalysis[];
  }) => void;
  setMemoryRaw: (memory: Memory, analyses: PhotoAnalysis[]) => void;
  addExistingArt: (art: ExistingArt) => void;

  openJuni: () => void;
  closeJuni: () => void;
  setJuniState: (s: JuniState) => void;
  setRecommendations: (r: JuniRecommendationsResponse | null) => void;
  setSelectedRec: (id: string | null) => void;
  setFollowupAnswer: (a: string | null) => void;
  setBrief: (b: CreativeBrief | null) => void;
  setActiveJob: (j: GenerationJob | null) => void;
  upsertJob: (j: GenerationJob) => void;
  setToast: (t: { title: string; subtitle?: string } | null) => void;
  recordLLMCall: (entry: import("@/lib/llmCalls").LLMCallLog) => void;
  updateLLMCall: (
    id: string,
    patch: Partial<import("@/lib/llmCalls").LLMCallLog>
  ) => void;
  clearLLMCalls: () => void;
  setDebugPanelOpen: (open: boolean) => void;
  setDebug: (patch: Partial<AppSettings["debug"]>) => void;
  decrementCreations: () => void;
  setOnboarded: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      hasOnboarded: false,
      juniState: "memory_loaded",
      juniOpen: false,
      recommendations: null,
      selectedRecId: null,
      followupAnswer: null,
      brief: null,
      activeJob: null,
      jobs: [],
      toast: null,
      llmCalls: [],
      debugPanelOpen: false,

      setSettings: (updater) =>
        set((state) => ({ settings: updater(state.settings) })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
      loadMemoryFromZip: ({ memory, photoAnalyses }) => {
        if (typeof window !== "undefined") {
          // Async-loaded so we don't create an import cycle.
          import("@/lib/llmCalls").then(({ trace }) =>
            trace(
              `[store] loadMemoryFromZip("${memory.snappy_title ?? memory.id}", ${photoAnalyses.length} photos) — clears recs`
            )
          );
        }
        set((state) => ({
          settings: {
            ...state.settings,
            memory,
            photoAnalyses,
            existingArt:
              memory.id === state.settings.memory?.id
                ? state.settings.existingArt
                : [],
          },
          juniState: "memory_loaded",
          recommendations: null,
          selectedRecId: null,
          brief: null,
        }));
      },
      setMemoryRaw: (memory, photoAnalyses) =>
        set((state) => ({
          settings: { ...state.settings, memory, photoAnalyses },
        })),
      addExistingArt: (art) =>
        set((state) => ({
          settings: {
            ...state.settings,
            existingArt: [...state.settings.existingArt, art],
          },
        })),

      openJuni: () => set({ juniOpen: true, juniState: "juni_open" }),
      closeJuni: () => set({ juniOpen: false }),
      setJuniState: (s) => set({ juniState: s }),
      setRecommendations: (r) => {
        if (typeof window !== "undefined") {
          const label = r
            ? `[store] setRecommendations(<${r.recommendations.length} recs>)`
            : "[store] setRecommendations(null) — clears recs";
          import("@/lib/llmCalls").then(({ trace }) => trace(label));
        }
        set({ recommendations: r });
      },
      setSelectedRec: (id) => set({ selectedRecId: id }),
      setFollowupAnswer: (a) => set({ followupAnswer: a }),
      setBrief: (b) => set({ brief: b }),
      setActiveJob: (j) => set({ activeJob: j }),
      upsertJob: (j) =>
        set((state) => {
          const idx = state.jobs.findIndex((x) => x.id === j.id);
          const next = [...state.jobs];
          if (idx === -1) next.push(j);
          else next[idx] = j;
          return { jobs: next, activeJob: j };
        }),
      setToast: (t) => set({ toast: t }),
      recordLLMCall: (entry) =>
        set((state) => ({ llmCalls: [entry, ...state.llmCalls].slice(0, 25) })),
      updateLLMCall: (id, patch) =>
        set((state) => ({
          llmCalls: state.llmCalls.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      clearLLMCalls: () => set({ llmCalls: [] }),
      setDebugPanelOpen: (open) => set({ debugPanelOpen: open }),
      setDebug: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            debug: { ...state.settings.debug, ...patch },
          },
        })),
      setOnboarded: (v) => set({ hasOnboarded: v }),
      decrementCreations: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            generation: {
              ...state.settings.generation,
              creationsLeft: Math.max(
                0,
                state.settings.generation.creationsLeft - 1
              ),
            },
          },
        })),
    }),
    {
      name: "juni-cfs-prototype",
      partialize: (state) => {
        const isDevPersist = !!state.settings.debug.devPersist;
        return {
          hasOnboarded: isDevPersist ? state.hasOnboarded : false,
          settings: {
            llm: state.settings.llm,
            prompts: state.settings.prompts,
            style: state.settings.style,
            capabilities: state.settings.capabilities,
            generation: state.settings.generation,
            artForms: state.settings.artForms,
            debug: state.settings.debug,
            // Conditionally persist memory session fields for local development
            memory: isDevPersist ? state.settings.memory : undefined,
            photoAnalyses: isDevPersist ? state.settings.photoAnalyses : undefined,
            existingArt: isDevPersist ? state.settings.existingArt : undefined,
          },
        };
      },
      // Merge the (partial) persisted settings onto the defaults so memory /
      // photoAnalyses / existingArt / debug come back fresh on every load.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          settings: {
            ...current.settings,
            ...(p.settings ?? {}),
          },
        };
      },
    }
  )
);
