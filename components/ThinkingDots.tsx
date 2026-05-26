"use client";

import React from "react";

export function ThinkingDots({ label }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-ink-500 text-[12px]">
      <span className="flex gap-1">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </span>
      {label && <span className="text-ink-500">{label}</span>}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-juni"
      style={{
        animation: `thinking-bounce 1.1s ${delay}ms infinite ease-in-out`,
      }}
    />
  );
}
