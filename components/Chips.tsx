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
            className={`px-3.5 py-2 rounded-full text-[12px] font-semibold transition active:scale-[0.98] ${
              isSel
                ? "bg-juni text-white shadow-sm"
                : "bg-juni-soft hover:bg-juni-soft/80 text-juni-ink"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
