import type { JuniRequestPayload } from "@/lib/juniClient";
import { fetchRecommendations } from "@/lib/juniClient";
import { useAppStore } from "@/lib/store";

export type LLMCallSource =
  | "setup-prefetch"
  | "page-prefetch"
  | "sheet-mount-fetch"
  | "more-ideas"
  | "freeform"
  | "trace";

export interface LLMCallLog {
  id: string;
  source: LLMCallSource;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  status: "pending" | "ok" | "error" | "skipped";
  reason?: string;
  promptChars?: number;
  promptPreview?: string;
  responseChars?: number;
  responsePreview?: string;
  errorMessage?: string;
}

/**
 * Lightweight one-shot trace entry — same shape as an LLM call log so it
 * shows up in the debug panel interleaved with real calls.
 */
export function trace(reason: string): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  useAppStore.getState().recordLLMCall({
    id: `trace-${now}-${Math.random().toString(36).slice(2, 6)}`,
    source: "trace",
    startedAt: now,
    endedAt: now,
    durationMs: 0,
    status: "skipped",
    reason,
  });
}

function approxPromptChars(payload: JuniRequestPayload): number {
  try {
    return JSON.stringify(payload.context).length;
  } catch {
    return 0;
  }
}

function approxPromptPreview(payload: JuniRequestPayload): string {
  try {
    const memory = payload.context.memory as any;
    const title =
      memory?.snappy_title || memory?.medium_title || memory?.id || "memory";
    const photoCount = Array.isArray(payload.context.photoAnalyses)
      ? payload.context.photoAnalyses.length
      : 0;
    const existingArt = Array.isArray(payload.context.existingArt)
      ? payload.context.existingArt.length
      : 0;
    const conv = payload.conversation;
    const convBits: string[] = [];
    if (conv?.userMessage) convBits.push(`userMessage="${conv.userMessage.slice(0, 60)}"`);
    if (conv?.moreIdeas) convBits.push(`moreIdeas=true`);
    if (conv?.excludeTitles?.length)
      convBits.push(`excludeTitles=${conv.excludeTitles.length}`);
    return `title="${title}", photos=${photoCount}, existingArt=${existingArt}${
      convBits.length ? ", " + convBits.join(", ") : ""
    }`;
  } catch {
    return "";
  }
}

/**
 * Wraps fetchRecommendations with store-side telemetry so each LLM call is
 * visible in the debug panel: source, timing, prompt size, response size,
 * error message. Returns null and records a "skipped" entry when `skipIf`
 * is true, so callers can guard duplicate prefetches without writing the
 * guard logic in five places.
 */
export async function loggedFetchRecommendations(
  source: LLMCallSource,
  payload: JuniRequestPayload,
  opts?: { skipIf?: boolean; skipReason?: string }
) {
  const store = useAppStore.getState();
  if (opts?.skipIf) {
    store.recordLLMCall({
      id: `llm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source,
      startedAt: Date.now(),
      endedAt: Date.now(),
      durationMs: 0,
      status: "skipped",
      reason: opts.skipReason ?? "skip flag",
      promptChars: approxPromptChars(payload),
      promptPreview: approxPromptPreview(payload),
    });
    return null;
  }

  const id = `llm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const startedAt = Date.now();
  store.recordLLMCall({
    id,
    source,
    startedAt,
    status: "pending",
    promptChars: approxPromptChars(payload),
    promptPreview: approxPromptPreview(payload),
  });

  try {
    const resp = await fetchRecommendations(payload);
    const endedAt = Date.now();
    const raw = typeof resp.raw === "string" ? resp.raw : "";
    store.updateLLMCall(id, {
      endedAt,
      durationMs: endedAt - startedAt,
      status: "ok",
      responseChars: raw.length,
      responsePreview: raw.slice(0, 500),
    });
    return resp;
  } catch (e: any) {
    const endedAt = Date.now();
    store.updateLLMCall(id, {
      endedAt,
      durationMs: endedAt - startedAt,
      status: "error",
      errorMessage: e?.message ?? String(e),
    });
    throw e;
  }
}
