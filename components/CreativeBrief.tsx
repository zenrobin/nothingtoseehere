"use client";

import React, { useEffect, useState } from "react";
import type { CreativeBrief } from "@/types";
import { TypewriterText } from "./TypewriterText";
import { ThinkingDots } from "./ThinkingDots";

interface Props {
  brief: CreativeBrief;
  onConfirm: () => void;
  onChangeDirection: () => void;
}

export function CreativeBriefCard({ brief, onConfirm, onChangeDirection }: Props) {
  const [thinking, setThinking] = useState(true);
  const [typed, setTyped] = useState(false);

  useEffect(() => {
    setThinking(true);
    setTyped(false);
    const t = setTimeout(() => setThinking(false), 600);
    return () => clearTimeout(t);
  }, [brief.summary]);

  return (
    <div className="flex gap-2.5 items-start animate-slide-up">
      <div className="w-7 h-7 shrink-0 rounded-full bg-juni text-white grid place-items-center text-[12px] font-bold shadow-card">
        J
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-sm bg-white shadow-card p-4">
        <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold mb-2">
          Here's what I'll make
        </div>
        {thinking ? (
          <ThinkingDots />
        ) : (
          <p className="text-[14px] leading-relaxed text-ink-900">
            <TypewriterText
              text={brief.summary}
              speedMs={10}
              onDone={() => setTyped(true)}
            />
          </p>
        )}
        {typed && brief.keyDetails.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 animate-fade-in">
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
        {typed && (
          <div className="mt-4 flex gap-2 animate-fade-in">
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
        )}
      </div>
    </div>
  );
}
