"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

export function DeviceFrame({ children }: Props) {
  return (
    <div className="device-frame">
      <div className="device-inner relative h-full w-full">{children}</div>
    </div>
  );
}

export function StatusBar({ title }: { title?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-medium text-ink-900">
      <span>9:41</span>
      <span className="text-ink-500 text-[10px] uppercase tracking-widest">
        {title}
      </span>
      <span className="flex items-center gap-1 text-ink-900">
        <span>●●●</span>
        <span>􀋨</span>
      </span>
    </div>
  );
}
