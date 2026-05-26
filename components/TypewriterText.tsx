"use client";

import React, { useEffect, useState } from "react";

interface Props {
  text: string;
  speedMs?: number;
  startDelayMs?: number;
  className?: string;
  onDone?: () => void;
  cursor?: boolean;
}

export function TypewriterText({
  text,
  speedMs = 14,
  startDelayMs = 0,
  className,
  onDone,
  cursor = true,
}: Props) {
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(startDelayMs === 0);

  useEffect(() => {
    setI(0);
    setStarted(startDelayMs === 0);
    if (startDelayMs > 0) {
      const t = setTimeout(() => setStarted(true), startDelayMs);
      return () => clearTimeout(t);
    }
  }, [text, startDelayMs]);

  useEffect(() => {
    if (!started) return;
    if (i >= text.length) {
      onDone?.();
      return;
    }
    // Variable delay to feel more natural — slight pause after punctuation.
    const ch = text[i];
    const punct = /[.,;!?—]/.test(ch);
    const delay = punct ? speedMs * 6 : speedMs + Math.random() * 6;
    const t = setTimeout(() => setI((v) => v + 1), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, started, text, speedMs]);

  const isDone = i >= text.length;
  return (
    <span className={className}>
      {text.slice(0, i)}
      {cursor && !isDone && started && (
        <span className="inline-block w-[1px] h-[1em] align-[-2px] ml-[1px] bg-current opacity-70 animate-pulse-soft" />
      )}
    </span>
  );
}
