"use client";

import React from "react";

interface Props {
  open: boolean;
  onUnlock?: () => void;
  onMaybeLater: () => void;
  /** When true, the user can dismiss; when false (out of creations), force interaction. */
  dismissible?: boolean;
}

const BENEFITS = [
  "Unlock your full memory timeline",
  "New memory stories every week",
  "Juni keeps finding memories worth revisiting",
  "Personalized stories, art, and visual starts from your photo library",
];

export function PayScreen({ open, onUnlock, onMaybeLater, dismissible = true }: Props) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-paper-warm/95 backdrop-blur-sm animate-fade-in">
      <div className="flex-1 scroll-area px-6 pt-10 pb-6 flex flex-col items-center">
        {/* Juni orb */}
        <div
          className="w-20 h-20 rounded-full grid place-items-center text-white text-[28px] font-bold shadow-card shrink-0"
          style={{
            background: "radial-gradient(circle at 35% 30%, #FCD8C7, #F5A8B6 50%, #C99BF0 100%)",
          }}
        >
          J
        </div>
        <div className="mt-4 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#E27A6C" }}>
          Juni
        </div>
        <h1 className="mt-3 font-sans text-[26px] leading-[1.15] tracking-tight text-ink-900 font-bold text-center">
          Unlock your full memory timeline
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-700 text-center max-w-[300px]">
          Your beautiful Memory Stories and Art are just one tap away.
        </p>

        <div className="mt-6 w-full max-w-[340px] bg-white rounded-2xl shadow-card p-5 space-y-3">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full grid place-items-center shrink-0 mt-0.5 text-white"
                style={{
                  background: "linear-gradient(135deg, #F5A8B6, #C99BF0)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[13.5px] leading-snug text-ink-900">{b}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-[42px] font-bold leading-none text-ink-900">$9.99</span>
            <span className="text-[14px] text-ink-500">/month</span>
          </div>
          <div className="mt-2 text-[12px] text-ink-500">Cancel anytime</div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 space-y-3">
        <button
          onClick={onUnlock}
          className="w-full py-3.5 rounded-full text-white text-[15px] font-semibold shadow-card active:scale-[0.99] transition"
          style={{
            background: "linear-gradient(95deg, #F5A8B6 0%, #C99BF0 100%)",
          }}
        >
          Unlock Juni
        </button>
        {dismissible && (
          <button
            onClick={onMaybeLater}
            className="w-full py-2.5 rounded-full text-[13px] font-semibold text-ink-700"
          >
            Maybe later
          </button>
        )}
      </div>
    </div>
  );
}
