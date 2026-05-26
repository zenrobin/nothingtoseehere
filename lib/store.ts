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
    provider: "mock",
    model: "claude-haiku-4-5-20251001",
    apiKey: "",
    temperature: 0.7,
    maxTokens: 1500,
    streaming: false,
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
  debug: {},
};

interface AppState {
  settings: AppSettings;
  juniState: JuniState;
  juniOpen: boolean;
  recommendations: JuniRecommendationsResponse | null;
  selectedRecId: string | null;
  followupAnswer: string | null;
  brief: CreativeBrief | null;
  activeJob: GenerationJob | null;
  jobs: GenerationJob[];
  toast: { title: string; subtitle?: string } | null;

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
  setDebug: (patch: Partial<AppSettings["debug"]>) => void;
  decrementCreations: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      juniState: "memory_loaded",
      juniOpen: false,
      recommendations: null,
      selectedRecId: null,
      followupAnswer: null,
      brief: null,
      activeJob: null,
      jobs: [],
      toast: null,

      setSettings: (updater) =>
        set((state) => ({ settings: updater(state.settings) })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
      loadMemoryFromZip: ({ memory, photoAnalyses }) =>
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
        })),
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
      setRecommendations: (r) => set({ recommendations: r }),
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
      setDebug: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            debug: { ...state.settings.debug, ...patch },
          },
        })),
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
      partialize: (state) => ({
        settings: state.settings,
        jobs: state.jobs,
      }),
    }
  )
);
