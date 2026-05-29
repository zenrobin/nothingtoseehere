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
    <div className="space-y-3 animate-slide-up py-2">
      <div>
        <div className="text-[11px] uppercase tracking-widest text-ink-500 font-semibold mb-1">
          Here's what I'll make
        </div>
        {thinking ? (
          <ThinkingDots />
        ) : (
          <p className="text-[14px] leading-relaxed text-ink-900 font-normal">
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
                className="text-[11px] px-2.5 py-1 rounded-full bg-juni-soft text-juni-ink font-medium"
              >
                {d}
              </span>
            ))}
          </div>
        )}
        {typed && (
          <div className="mt-4 flex gap-2.5 animate-fade-in">
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
