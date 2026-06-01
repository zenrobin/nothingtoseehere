export type EmotionalTone =
  | "sensory_and_embodied"
  | "joyful"
  | "elegiac"
  | "nostalgic"
  | "playful"
  | string;

export interface MemoryCategory {
  main: string;
  subcategories: string[];
  relevance: number;
}

export interface MemoryTimelineEntry {
  time: string;
  event: string;
  photo_ids: number[];
  timestamp: string;
  location: string;
}

export interface Memory {
  id: string;
  one_word_title: string;
  snappy_title: string;
  medium_title: string;
  detailed_title: string;
  descriptive_title: string;
  memory_summary: string;
  memory_narrative: string;
  editorial_intro: string;
  score: number;
  emotional_tone: EmotionalTone;
  cover_photo_id: number;
  categories: MemoryCategory[];
  timeline: MemoryTimelineEntry[];
  narrativePrompt?: string;
}

export interface PhotoAnalysis {
  photo_id: number;
  description: string;
  scores: {
    aesthetic: number;
    emotional: number;
    memory_value: number;
  };
  key_elements: string[];
  location_context: string;
  time_context: string;
  /**
   * Either a data: URL from a locally-uploaded file or an https:// URL from
   * the memory ZIP's photos.json. Both render the same way in <img src>.
   */
  imageDataUrl?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  latitude?: number;
  longitude?: number;
  parsedLocation?: {
    city?: string | null;
    country?: string | null;
    point_of_interest?: string | null;
  };
}

export type ArtFormKind = "genArt" | "movie" | "card" | "print" | "book";

export interface ExistingArt {
  id: string;
  memoryId: string;
  kind: ArtFormKind;
  title: string;
  subtitle?: string;
  thumbColor: string; // tailwind gradient classes
  iconHint?: string;
  createdAt: string;
}

export interface ArtFormTemplate {
  id: string;
  name: string;
  artform: ArtFormKind;
  bestFor: string;
  style: string;
  rationale: string;
  placeholderGradient: string; // tailwind gradient classes
  tags: string[];
}

export interface JuniFollowupQuestion {
  question: string;
  chips: string[];
}

export interface JuniRecommendation {
  id: string;
  artform: "genArt" | "movie";
  title: string;
  description: string;
  why: string;
  suggestedTemplateId: string | null;
  followupQuestion: JuniFollowupQuestion;
}

export interface MemoryRead {
  emotionalTone: string[];
  specificDetails: string[];
  alreadyCovered: string[];
  creativeOpportunities: string[];
}

export interface JuniRecommendationsResponse {
  openingMessage: string;
  memoryRead: MemoryRead;
  recommendations: JuniRecommendation[];
}

export interface CreativeBrief {
  artform: "genArt" | "movie";
  sourceMemoryId: string;
  conceptId: string;
  conceptTitle: string;
  templateId: string | null;
  templateName: string | null;
  tone: string;
  keyDetails: string[];
  differentiator: string;
  summary: string;
  movieControls?: MovieControls;
}

export interface MovieControls {
  theme: "elegant" | "joyful";
  length: "shorter" | "longer";
  textDensity: "more" | "less";
  feature: string;
  music?: string;
  title?: string;
}

export type GenerationStatus = "pending" | "complete" | "failed";

export interface GenerationJob {
  id: string;
  memoryId: string;
  brief: CreativeBrief;
  status: GenerationStatus;
  startedAt: number;
  completedAt?: number;
  result?: {
    title: string;
    explanation: string;
    thumbGradient: string;
    kind: ArtFormKind;
  };
}

export type LLMProvider = "anthropic" | "openai" | "gemini";

export interface AppSettings {
  llm: {
    provider: LLMProvider;
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number;
    streaming: boolean;
    thinkingLevel?: "minimal" | "low" | "medium" | "high";
  };
  prompts: {
    system: string;
    recommendation: string;
  };
  style: {
    concise: number; // 0..100, higher = more concise
    proactive: number; // 0..100, higher = more proactive
    magical: number; // 0..100, higher = more magical
    askMore: number; // 0..100, higher = ask more questions
  };
  capabilities: {
    genArt: boolean;
    movie: boolean;
    gallery: boolean;
    rawIdea: boolean;
    artForms: boolean;
    existingArtAwareness: boolean;
  };
  generation: {
    delayMs: number;
    failureRatePct: number;
    creationsLeft: number;
    returnInline: boolean;
  };
  artForms: ArtFormTemplate[];
  memory?: Memory;
  photoAnalyses: PhotoAnalysis[];
  existingArt: ExistingArt[];
  debug: {
    lastContext?: unknown;
    lastRequest?: unknown;
    lastResponse?: unknown;
    lastBrief?: CreativeBrief;
  };
}

export type JuniState =
  | "memory_loaded"
  | "juni_open"
  | "recommendations_loading"
  | "recommendations_ready"
  | "concept_selected"
  | "followup_answered"
  | "brief_ready"
  | "generating"
  | "generated"
  | "generation_failed";
