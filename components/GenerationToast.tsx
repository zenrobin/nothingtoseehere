"use client";

import React from "react";

interface Props {
  title: string;
  subtitle?: string;
  onDismiss?: () => void;
}

export function GenerationToast({ title, subtitle, onDismiss }: Props) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-40 animate-slide-up">
      <div className="bg-ink-900/95 text-white rounded-2xl px-4 py-3 shadow-card max-w-[300px]">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-juni grid place-items-center text-[10px] font-bold animate-pulse-soft mt-0.5">
            J
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">{title}</div>
            {subtitle && (
              <div className="text-[11px] text-white/70 mt-0.5">{subtitle}</div>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white/70 text-[14px] leading-none -mt-1"
              aria-label="Dismiss"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
