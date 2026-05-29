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
    <div className="space-y-3 animate-slide-up py-1">
      <div className="flex items-start gap-2.5 animate-fade-in pr-10">
        <div className="w-8 h-8 shrink-0 rounded-full bg-juni text-white grid place-items-center text-[12px] font-bold shadow-card">
          J
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-juni font-semibold mb-1">
            Juni · Here's what I'll make
          </div>
          <div className="rounded-2xl rounded-tl-md bg-white shadow-card px-4 py-3 text-[14px] leading-relaxed text-ink-900">
            {thinking ? (
              <ThinkingDots />
            ) : (
              <TypewriterText
                text={brief.summary}
                speedMs={10}
                onDone={() => setTyped(true)}
              />
            )}
          </div>
        </div>
      </div>

      {typed && (
        <div className="pl-[42px] mt-3 flex gap-2.5 animate-fade-in">
          <button
            onClick={onChangeDirection}
            className="flex-1 rounded-full py-3 text-[13px] font-semibold text-ink-700 bg-[#F8F7F3] active:scale-[0.99]"
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
  );
}
