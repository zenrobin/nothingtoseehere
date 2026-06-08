"use client";

import React from "react";

export type NavItemId =
  | "home"
  | "memories"
  | "memory-art"
  | "themes"
  | "projects"
  | "account"
  | "help";

const ITEMS: { id: NavItemId; label: string; enabled: boolean; hint?: string }[] = [
  { id: "home", label: "Home", enabled: false, hint: "Soon" },
  { id: "memories", label: "Memories", enabled: true, hint: "You are here" },
  { id: "memory-art", label: "Memory Art", enabled: true, hint: "Gallery" },
  { id: "themes", label: "Themes", enabled: false, hint: "Soon" },
  { id: "projects", label: "Projects", enabled: false, hint: "Soon" },
  { id: "account", label: "Account", enabled: false, hint: "Soon" },
  { id: "help", label: "Help", enabled: false, hint: "Soon" },
];

interface Props {
  open: boolean;
  current: NavItemId;
  onClose: () => void;
  onSelect: (id: NavItemId) => void;
}

export function HamburgerMenu({ open, current, onClose, onSelect }: Props) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex">
      <button
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 animate-fade-in"
      />
      <div className="relative w-[78%] max-w-[320px] h-full bg-white shadow-sheet flex flex-col animate-slide-in-left">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-juni text-white grid place-items-center text-[13px] font-bold shadow-card">
              J
            </div>
            <div>
              <div className="text-[13px] font-semibold text-ink-900 leading-tight">
                Juni
              </div>
              <div className="text-[10px] text-ink-500 leading-tight">
                Mixbook prototype
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full grid place-items-center text-ink-500 hover:bg-black/5 text-[14px]"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="flex-1 px-3 pt-2 pb-6 space-y-0.5">
          {ITEMS.map((it) => {
            const isCurrent = it.id === current;
            return (
              <button
                key={it.id}
                onClick={() => it.enabled && onSelect(it.id)}
                disabled={!it.enabled}
                className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between transition ${
                  isCurrent
                    ? "bg-juni-soft text-juni-ink"
                    : it.enabled
                    ? "text-ink-900 hover:bg-ink-100/60 active:scale-[0.99]"
                    : "text-ink-300"
                }`}
              >
                <span className="text-[14px] font-semibold">{it.label}</span>
                {it.hint && (
                  <span
                    className={`text-[10px] uppercase tracking-widest font-medium ${
                      isCurrent
                        ? "text-juni"
                        : it.enabled
                        ? "text-ink-400"
                        : "text-ink-300"
                    }`}
                  >
                    {it.hint}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
