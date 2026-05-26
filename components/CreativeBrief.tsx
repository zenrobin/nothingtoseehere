"use client";

import React from "react";
import type { CreativeBrief } from "@/types";

interface Props {
  brief: CreativeBrief;
  onConfirm: () => void;
  onChangeDirection: () => void;
}

export function CreativeBriefCard({ brief, onConfirm, onChangeDirection }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow-card p-4 animate-slide-up">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-juni text-white grid place-items-center text-[12px] font-bold">
          J
        </div>
        <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold">
          Creative brief
        </div>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-900">
        {brief.summary}
      </p>
      {brief.keyDetails.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {brief.keyDetails.slice(0, 4).map((d) => (
            <span
              key={d}
              className="text-[11px] px-2 py-0.5 rounded-full bg-juni-soft text-juni-ink"
            >
              {d}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onChangeDirection}
          className="flex-1 rounded-full py-3 text-[13px] font-semibold text-ink-700 bg-paper-warm active:scale-[0.99]"
        >
          Change direction
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-full py-3 text-[13px] font-semibold text-white bg-juni active:scale-[0.99]"
        >
          Create this
        </button>
      </div>
    </div>
  );
}
