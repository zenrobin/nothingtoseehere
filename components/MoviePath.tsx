"use client";

import React from "react";
import type { Memory, MovieControls } from "@/types";

interface Props {
  memory: Memory;
  hasPeople: boolean;
  theme: MovieControls["theme"];
  setTheme: (t: MovieControls["theme"]) => void;
  length: MovieControls["length"];
  setLength: (l: MovieControls["length"]) => void;
  textDensity: MovieControls["textDensity"];
  setTextDensity: (d: MovieControls["textDensity"]) => void;
  feature: string;
  setFeature: (f: string) => void;
}

function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex bg-[#EAE8E2]/70 p-0.5 rounded-full w-full select-none border border-ink-200/10 h-9 items-center">
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 text-center rounded-full text-[12px] font-semibold transition-all duration-300 outline-none h-8 flex items-center justify-center ${
              isSelected
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-800 active:opacity-70"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function MoviePathPanel({
  memory,
  hasPeople,
  theme,
  setTheme,
  length,
  setLength,
  textDensity,
  setTextDensity,
  feature,
  setFeature,
}: Props) {
  const featureOptions = hasPeople
    ? [
        { value: "Whole memory", label: "Whole Memory" },
        { value: "A specific person", label: "Person" },
        { value: "Details and place", label: "Details & Place" },
      ]
    : [
        { value: "Feature the place", label: "Place" },
        { value: "Feature everyday details", label: "Details" },
        { value: "Let Juni choose", label: "Juni's Choice" },
      ];

  return (
    <div className="space-y-4 select-none">
      <Group label="Theme">
        <SegmentedControl
          options={[
            { value: "elegant", label: "Elegant" },
            { value: "joyful", label: "Joyful" },
          ]}
          selected={theme}
          onChange={setTheme}
        />
      </Group>

      <Group label="Length">
        <SegmentedControl
          options={[
            { value: "shorter", label: "Shorter" },
            { value: "longer", label: "Longer" },
          ]}
          selected={length}
          onChange={setLength}
        />
      </Group>

      <Group label="Text Density">
        <SegmentedControl
          options={[
            { value: "less", label: "Less Text" },
            { value: "more", label: "More Text" },
          ]}
          selected={textDensity}
          onChange={setTextDensity}
        />
      </Group>

      <Group label="Focus Area">
        <SegmentedControl
          options={featureOptions}
          selected={feature}
          onChange={setFeature}
        />
      </Group>
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
    <div className="space-y-1.5">
      <div className="text-[10px] uppercase tracking-widest text-ink-400 font-bold pl-1">
        {label}
      </div>
      {children}
    </div>
  );
}
