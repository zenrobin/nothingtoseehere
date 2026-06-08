"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import type { LLMCallLog } from "@/lib/llmCalls";

const SOURCE_COLORS: Record<LLMCallLog["source"], string> = {
  "setup-prefetch": "#5B4FE9",
  "page-prefetch": "#7B6FFB",
  "sheet-mount-fetch": "#E48A2A",
  "more-ideas": "#1E40AF",
  "freeform": "#9333EA",
  "trace": "#94A3B8",
};

const STATUS_COLORS: Record<LLMCallLog["status"], string> = {
  pending: "#9CA3AF",
  ok: "#16A34A",
  error: "#DC2626",
  skipped: "#64748B",
};

export function DebugFab() {
  const open = useAppStore((s) => s.debugPanelOpen);
  const setOpen = useAppStore((s) => s.setDebugPanelOpen);
  const calls = useAppStore((s) => s.llmCalls);
  const pendingCount = calls.filter((c) => c.status === "pending").length;
  const recent = calls[0];
  const recentBadge =
    recent?.status === "pending"
      ? "…"
      : recent?.durationMs != null
      ? `${(recent.durationMs / 1000).toFixed(1)}s`
      : "";

  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-5 left-5 z-30 flex items-center gap-2 px-3 py-2 rounded-full bg-ink-900/90 text-white text-[11px] font-mono shadow-card backdrop-blur active:scale-[0.97]"
      aria-label="Debug panel"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          pendingCount > 0
            ? "bg-juni animate-pulse-soft"
            : recent?.status === "error"
            ? "bg-red-400"
            : "bg-emerald-400"
        }`}
      />
      <span>debug</span>
      {recentBadge && <span className="opacity-75">· {recentBadge}</span>}
    </button>
  );
}

export function DebugPanel() {
  const open = useAppStore((s) => s.debugPanelOpen);
  const setOpen = useAppStore((s) => s.setDebugPanelOpen);
  const calls = useAppStore((s) => s.llmCalls);
  const clearLLMCalls = useAppStore((s) => s.clearLLMCalls);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col">
      <button
        aria-label="Close debug"
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={() => setOpen(false)}
      />
      <div className="mt-auto relative bg-white rounded-t-3xl shadow-sheet animate-slide-up max-h-[85%] flex flex-col">
        <div className="pt-2 flex flex-col items-center">
          <div className="w-10 h-1 rounded-full bg-ink-100" />
        </div>
        <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-ink-100">
          <div>
            <div className="text-[14px] font-semibold text-ink-900">LLM call log</div>
            <div className="text-[11px] text-ink-500">
              {calls.length === 0
                ? "No calls yet."
                : `${calls.length} call${calls.length > 1 ? "s" : ""} captured (most recent first)`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearLLMCalls}
              className="text-[11px] text-ink-500 px-2 py-1 rounded hover:bg-ink-100"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full grid place-items-center text-ink-500 hover:bg-ink-100 text-[14px]"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5 no-scrollbar">
          {calls.length === 0 && (
            <div className="text-[12px] text-ink-500 py-6 text-center">
              Tap "Use this memory" or open the Juni sheet to trigger an LLM
              call.
            </div>
          )}
          {calls.map((c) => (
            <CallRow key={c.id} call={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CallRow({ call }: { call: LLMCallLog }) {
  const [expanded, setExpanded] = React.useState(false);
  const duration =
    call.durationMs != null
      ? `${(call.durationMs / 1000).toFixed(2)}s`
      : "—";
  const isTrace = call.source === "trace";
  return (
    <div className="rounded-xl border border-ink-100 bg-paper-cream/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-start gap-2 text-left"
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
          style={{ background: SOURCE_COLORS[call.source] }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-semibold text-ink-900">
              {call.source}
            </span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full text-white shrink-0"
              style={{ background: STATUS_COLORS[call.status] }}
            >
              {call.status}
            </span>
            <span className="text-[10px] text-ink-500 font-mono ml-auto shrink-0">
              {duration}
            </span>
          </div>
          {isTrace && call.reason && (
            <div className="mt-0.5 text-[10.5px] font-mono text-ink-700 break-words leading-snug">
              {call.reason}
            </div>
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 text-[11px] text-ink-700 font-mono space-y-2 border-t border-ink-100/70 pt-2">
          <Row label="started">{new Date(call.startedAt).toISOString()}</Row>
          {call.endedAt != null && (
            <Row label="ended">{new Date(call.endedAt).toISOString()}</Row>
          )}
          {call.reason && !isTrace && <Row label="reason">{call.reason}</Row>}
          {call.promptChars != null && (
            <Row label="prompt chars">
              {call.promptChars.toLocaleString()}{" "}
              <span className="text-ink-400">
                (~{Math.round(call.promptChars / 4)} tokens)
              </span>
            </Row>
          )}
          {call.promptPreview && (
            <Row label="prompt">{call.promptPreview}</Row>
          )}
          {call.responseChars != null && (
            <Row label="response chars">
              {call.responseChars.toLocaleString()}{" "}
              <span className="text-ink-400">
                (~{Math.round(call.responseChars / 4)} tokens)
              </span>
            </Row>
          )}
          {call.responsePreview && (
            <Row label="response">
              <span className="whitespace-pre-wrap break-words">
                {call.responsePreview}
                {call.responseChars && call.responseChars > 500
                  ? `\n…+${call.responseChars - 500} more chars`
                  : ""}
              </span>
            </Row>
          )}
          {call.errorMessage && (
            <Row label="error">
              <span className="text-red-600 break-words">
                {call.errorMessage}
              </span>
            </Row>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-ink-400 shrink-0 w-[88px]">{label}</span>
      <span className="flex-1 min-w-0 break-words">{children}</span>
    </div>
  );
}
