"use client";

import React from "react";

interface Props {
  chips: string[];
  selected?: string | null;
  onSelect: (c: string) => void;
}

export function Chips({ chips, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => {
        const isSel = selected === c;
        return (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`px-3 py-2 rounded-full text-[12px] font-medium transition active:scale-[0.98] ${
              isSel
                ? "bg-juni text-white"
                : "bg-white text-ink-700 border border-ink-100"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
