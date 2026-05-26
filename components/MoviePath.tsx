"use client";

import React, { useState } from "react";
import type { Memory, MovieControls } from "@/types";
import { Chips } from "./Chips";

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

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-juni-DEFAULT text-white grid place-items-center text-[12px] font-bold">
            J
          </div>
          <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold">
            Movie
          </div>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-900">
          I can make a quiet, elegant movie around the porch and the feeling of
          arriving home, or a shorter, warmer version that focuses on the
          everyday details.
        </p>
      </div>

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
          className="flex-1 rounded-full py-3 text-[13px] font-semibold text-white bg-juni-DEFAULT active:scale-[0.99]"
        >
          Make this movie
        </button>
      </div>
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
