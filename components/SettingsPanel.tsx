"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore, DEFAULT_SETTINGS } from "@/lib/store";
import type { AppSettings, LLMProvider } from "@/types";
import { DeviceFrame } from "./DeviceFrame";

export function SettingsPanel() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const resetSettings = useAppStore((s) => s.resetSettings);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const [serverKeys, setServerKeys] = useState<{
    hasAnthropicKey: boolean;
    hasOpenAIKey: boolean;
    hasGeminiKey: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setServerKeys)
      .catch(() => {});
  }, []);

  const update = (patch: Partial<AppSettings>) =>
    setSettings((s) => ({ ...s, ...patch }));

  return (
    <DeviceFrame>
      <div className="h-full flex flex-col bg-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <Link
            href="/"
            className="w-9 h-9 rounded-full grid place-items-center text-ink-700 hover:bg-black/5"
            aria-label="Back"
          >
            ←
          </Link>
          <div className="text-[11px] uppercase tracking-widest text-ink-500">
            Settings
          </div>
          <button
            onClick={() => {
              if (confirm("Reset all settings to defaults?")) resetSettings();
            }}
            className="text-[11px] text-juni font-medium px-2"
          >
            Reset
          </button>
        </div>
        <div className="flex-1 scroll-area px-4 pb-8 space-y-5">
          <Section title="LLM" subtitle={`Mode: ${settings.llm.provider}`}>
            <Field label="Provider">
              <select
                value={settings.llm.provider}
                onChange={(e) => {
                  const val = e.target.value as LLMProvider;
                  setSettings((s) => ({
                    ...s,
                    llm: {
                      ...s.llm,
                      provider: val,
                      model: val === "gemini" ? "gemini-3.5-flash" : val === "openai" ? "gpt-4o-mini" : "claude-haiku-4-5-20251001",
                    },
                  }));
                }}
                className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[13px]"
              >
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
            </Field>
            <Field label="Model">
              <input
                value={settings.llm.model}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    llm: { ...s.llm, model: e.target.value },
                  }))
                }
                placeholder={
                  settings.llm.provider === "gemini"
                    ? "e.g. gemini-3.5-flash"
                    : settings.llm.provider === "openai"
                    ? "e.g. gpt-4o-mini"
                    : "e.g. claude-haiku-4-5-20251001"
                }
                className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[13px]"
              />
            </Field>
            {settings.llm.provider === "gemini" && (
              <Field label="Thinking Level">
                <select
                  value={settings.llm.thinkingLevel || "medium"}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      llm: {
                        ...s.llm,
                        thinkingLevel: e.target.value as any,
                      },
                    }))
                  }
                  className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[13px]"
                >
                  <option value="minimal">Minimal (Low Latency)</option>
                  <option value="low">Low (Economical / Coding)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Deep reasoning)</option>
                </select>
              </Field>
            )}
            <Field
              label="API Key"
              hint={
                settings.llm.provider === "anthropic" && serverKeys?.hasAnthropicKey
                  ? "Server has ANTHROPIC_API_KEY set — leave blank to use it. Anything you paste here overrides it locally."
                  : settings.llm.provider === "openai" && serverKeys?.hasOpenAIKey
                  ? "Server has OPENAI_API_KEY set — leave blank to use it."
                  : settings.llm.provider === "gemini" && serverKeys?.hasGeminiKey
                  ? "Server has GEMINI_API_KEY set — leave blank to use it."
                  : settings.llm.provider === "anthropic"
                  ? "Set ANTHROPIC_API_KEY in Vercel env, or paste a key here (stored locally only)."
                  : settings.llm.provider === "openai"
                  ? "Set OPENAI_API_KEY in env, or paste a key here (stored locally only)."
                  : "Set GEMINI_API_KEY in env, or paste a key here (stored locally only)."
              }
            >
              <input
                type="password"
                value={settings.llm.apiKey}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    llm: { ...s.llm, apiKey: e.target.value },
                  }))
                }
                placeholder={
                  serverKeys &&
                  ((settings.llm.provider === "anthropic" &&
                    serverKeys.hasAnthropicKey) ||
                    (settings.llm.provider === "openai" &&
                      serverKeys.hasOpenAIKey) ||
                    (settings.llm.provider === "gemini" &&
                      serverKeys.hasGeminiKey))
                    ? "Using server env var"
                    : "Key or API token..."
                }
                className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[13px]"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Temperature">
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={2}
                  value={settings.llm.temperature}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      llm: {
                        ...s.llm,
                        temperature: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[13px]"
                />
              </Field>
              <Field label="Max tokens">
                <input
                  type="number"
                  value={settings.llm.maxTokens}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      llm: { ...s.llm, maxTokens: Number(e.target.value) },
                    }))
                  }
                  className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[13px]"
                />
              </Field>
            </div>
            <Toggle
              label="Streaming"
              value={settings.llm.streaming}
              onChange={(v) =>
                setSettings((s) => ({ ...s, llm: { ...s.llm, streaming: v } }))
              }
            />
          </Section>

          <Section title="Juni system prompt">
            <textarea
              value={settings.prompts.system}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  prompts: { ...s.prompts, system: e.target.value },
                }))
              }
              rows={10}
              className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[12px] font-mono leading-snug"
            />
          </Section>

          <Section title="Recommendation prompt">
            <textarea
              value={settings.prompts.recommendation}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  prompts: {
                    ...s.prompts,
                    recommendation: e.target.value,
                  },
                }))
              }
              rows={8}
              className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[12px] font-mono leading-snug"
            />
          </Section>

          <Section title="Response style">
            <Slider
              label="Concise ↔ Expressive"
              value={settings.style.concise}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  style: { ...s.style, concise: v },
                }))
              }
              leftLabel="Expressive"
              rightLabel="Concise"
            />
            <Slider
              label="Neutral ↔ Proactive"
              value={settings.style.proactive}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  style: { ...s.style, proactive: v },
                }))
              }
              leftLabel="Neutral"
              rightLabel="Proactive"
            />
            <Slider
              label="Practical ↔ Magical"
              value={settings.style.magical}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  style: { ...s.style, magical: v },
                }))
              }
              leftLabel="Practical"
              rightLabel="Magical"
            />
            <Slider
              label="Fewer questions ↔ More"
              value={settings.style.askMore}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  style: { ...s.style, askMore: v },
                }))
              }
              leftLabel="Fewer"
              rightLabel="More"
            />
          </Section>

          <Section title="Capabilities">
            {(
              [
                ["genArt", "Enable GenArt"],
                ["movie", "Enable Movie"],
                ["gallery", "Enable Gallery flow"],
                ["rawIdea", "Enable raw idea mode"],
                ["artForms", "Enable ArtForm templates"],
                ["existingArtAwareness", "Enable existing art awareness"],
              ] as const
            ).map(([k, label]) => (
              <Toggle
                key={k}
                label={label}
                value={settings.capabilities[k]}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    capabilities: { ...s.capabilities, [k]: v },
                  }))
                }
              />
            ))}
          </Section>

          <Section title="Generation simulation">
            <Field label={`Delay: ${settings.generation.delayMs} ms`}>
              <input
                type="range"
                min={500}
                max={20000}
                step={500}
                value={settings.generation.delayMs}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    generation: {
                      ...s.generation,
                      delayMs: Number(e.target.value),
                    },
                  }))
                }
                className="w-full"
              />
            </Field>
            <Field
              label={`Failure rate: ${settings.generation.failureRatePct}%`}
            >
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={settings.generation.failureRatePct}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    generation: {
                      ...s.generation,
                      failureRatePct: Number(e.target.value),
                    },
                  }))
                }
                className="w-full"
              />
            </Field>
            <Field label="Creations left">
              <input
                type="number"
                value={settings.generation.creationsLeft}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    generation: {
                      ...s.generation,
                      creationsLeft: Number(e.target.value),
                    },
                  }))
                }
                className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[13px]"
              />
            </Field>
            <Toggle
              label="Return inline (vs wait screen)"
              value={settings.generation.returnInline}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  generation: { ...s.generation, returnInline: v },
                }))
              }
            />
          </Section>

          <JsonEditor
            title="ArtForm catalog"
            value={settings.artForms}
            onChange={(v) =>
              setSettings((s) => ({ ...s, artForms: v as any }))
            }
            rows={10}
          />
          <JsonEditor
            title="Memory & analyses"
            value={{
              memory: settings.memory,
              photoAnalyses: settings.photoAnalyses,
              existingArt: settings.existingArt,
            }}
            onChange={(v: any) =>
              setSettings((s) => ({
                ...s,
                memory: v?.memory ?? s.memory,
                photoAnalyses: v?.photoAnalyses ?? s.photoAnalyses,
                existingArt: v?.existingArt ?? s.existingArt,
              }))
            }
            rows={10}
          />

          <Section title="Debug">
            <Toggle
              label="Keep memory on reload (Dev)"
              value={!!settings.debug.devPersist}
              onChange={(v) =>
                setSettings((s) => ({
                  ...s,
                  debug: { ...s.debug, devPersist: v },
                }))
              }
            />
            <div className="h-px bg-ink-100/70 my-2" />
            <DebugLine label="Last context" value={settings.debug.lastContext} />
            <DebugLine label="Last request" value={settings.debug.lastRequest} />
            <DebugLine label="Last response" value={settings.debug.lastResponse} />
            <DebugLine label="Last brief" value={settings.debug.lastBrief} />
          </Section>

          <button
            onClick={() => setOnboarded(false)}
            className="w-full rounded-2xl bg-white shadow-card px-4 py-3 text-[13px] font-semibold text-ink-900 active:scale-[0.99]"
          >
            Re-open setup screen
          </button>

          <button
            onClick={() => {
              useAppStore.getState().setDebugPanelOpen(true);
              window.history.back();
            }}
            className="w-full rounded-2xl bg-white shadow-card px-4 py-3 text-[13px] font-semibold text-ink-900 active:scale-[0.99] flex items-center justify-between"
          >
            <span>Open LLM call log</span>
            <span className="text-[11px] text-ink-400 font-mono">debug</span>
          </button>

          <div className="text-center text-[10px] text-ink-300 py-4">
            LLM mode: <span className="font-semibold">{settings.llm.provider}</span>
          </div>
        </div>
      </div>
    </DeviceFrame>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-card p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="text-[14px] font-semibold text-ink-900">{title}</div>
        {subtitle && (
          <div className="text-[11px] text-ink-500">{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold mb-1.5">
        {label}
      </div>
      {children}
      {hint && <div className="mt-1 text-[10px] text-ink-300">{hint}</div>}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between py-1.5"
    >
      <span className="text-[13px] text-ink-700">{label}</span>
      <span
        className={`w-10 h-6 rounded-full p-0.5 transition ${
          value ? "bg-juni" : "bg-ink-100"
        }`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}

function Slider({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  leftLabel?: string;
  rightLabel?: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold mb-1.5">
        {label}
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-ink-300 mt-0.5">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function JsonEditor({
  title,
  value,
  onChange,
  rows = 8,
}: {
  title: string;
  value: unknown;
  onChange: (v: unknown) => void;
  rows?: number;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);
  React.useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);
  return (
    <Section title={title}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={rows}
        className="w-full bg-white border border-ink-100 rounded-lg px-3 py-2 text-[11px] font-mono leading-snug"
      />
      {error && <div className="text-[11px] text-red-500">{error}</div>}
      <button
        onClick={() => {
          try {
            const parsed = JSON.parse(text);
            onChange(parsed);
            setError(null);
          } catch (e: any) {
            setError(e?.message ?? "Invalid JSON");
          }
        }}
        className="w-full mt-1 rounded-full py-2 text-[12px] font-semibold text-white bg-juni"
      >
        Apply
      </button>
    </Section>
  );
}

function DebugLine({ label, value }: { label: string; value: unknown }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-ink-100/70 pt-2 first:border-0 first:pt-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between"
      >
        <span className="text-[12px] font-semibold text-ink-700">{label}</span>
        <span className="text-[11px] text-ink-300">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <pre className="mt-2 text-[10px] font-mono leading-snug text-ink-700 bg-paper-warm rounded-lg p-2 max-h-48 overflow-auto">
          {value === undefined ? "—" : JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}
