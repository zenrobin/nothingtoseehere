"use client";

import React, { useEffect, useState } from "react";
import type { Memory, MovieControls } from "@/types";
import { Chips } from "./Chips";
import { TypewriterText } from "./TypewriterText";
import { ThinkingDots } from "./ThinkingDots";

interface Props {
  memory: Memory;
  hasPeople: boolean;
  onConfirm: (controls: MovieControls) => void;
  onCancel: () => void;
}

export function MoviePathPanel({ memory, hasPeople, onConfirm, onCancel }: Props) {
  const [theme, setTheme] = useState<MovieControls["theme"]>("elegant");
  const [length, setLength] = useState<MovieControls["length"]>("shorter");
  const [textDensity, setTextDensity] =
    useState<MovieControls["textDensity"]>("less");
  const featureOptions = hasPeople
    ? ["Whole memory", "A specific person", "Details and place"]
    : ["Feature the place", "Feature everyday details", "Let Juni choose"];
  const [feature, setFeature] = useState<string>(featureOptions[2]);
  const [thinking, setThinking] = useState(true);
  const [typed, setTyped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setThinking(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex gap-2.5 items-start">
        <div className="w-7 h-7 shrink-0 rounded-full bg-juni text-white grid place-items-center text-[12px] font-bold shadow-card">
          J
        </div>
        <div className="flex-1 rounded-2xl rounded-tl-md bg-white shadow-card p-4">
          <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold mb-1.5">
            Movie
          </div>
          {thinking ? (
            <ThinkingDots />
          ) : (
            <p className="text-[14px] leading-relaxed text-ink-900">
              <TypewriterText
                text="I'd make a 30-second movie — three details, three title cards, solo piano. Or a longer, more elegant version that pulls in the whole façade. Pick how it should feel."
                speedMs={10}
                onDone={() => setTyped(true)}
              />
            </p>
          )}
        </div>
      </div>

      {typed && (
        <div className="space-y-5 animate-fade-in">
      <Group label="Theme">
        <Chips
          chips={["Elegant", "Joyful"]}
          selected={theme === "elegant" ? "Elegant" : "Joyful"}
          onSelect={(c) =>
            setTheme(c.toLowerCase() === "elegant" ? "elegant" : "joyful")
          }
        />
      </Group>

      <Group label="Length">
        <Chips
          chips={["Shorter", "Longer"]}
          selected={length === "shorter" ? "Shorter" : "Longer"}
          onSelect={(c) =>
            setLength(c.toLowerCase() === "shorter" ? "shorter" : "longer")
          }
        />
      </Group>

      <Group label="Text">
        <Chips
          chips={["Less text", "More text"]}
          selected={textDensity === "less" ? "Less text" : "More text"}
          onSelect={(c) =>
            setTextDensity(
              c.toLowerCase().includes("less") ? "less" : "more"
            )
          }
        />
      </Group>

      <Group label="Feature">
        <Chips chips={featureOptions} selected={feature} onSelect={setFeature} />
        {!hasPeople && (
          <div className="mt-2 text-[11px] text-ink-500">
            No person detected in this memory yet — featuring a person isn't
            available.
          </div>
        )}
      </Group>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-full py-3 text-[13px] font-semibold text-ink-700 bg-paper-warm active:scale-[0.99]"
        >
          Back
        </button>
        <button
          onClick={() =>
            onConfirm({
              theme,
              length,
              textDensity,
              feature,
            })
          }
          className="flex-1 rounded-full py-3 text-[13px] font-semibold text-white bg-juni active:scale-[0.99]"
        >
          Make this movie
        </button>
      </div>
        </div>
      )}
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}
