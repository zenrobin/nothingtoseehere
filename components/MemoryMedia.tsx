"use client";

import React from "react";
import type { PhotoAnalysis } from "@/types";

export function MemoryMedia({ photos }: { photos: PhotoAnalysis[] }) {
  return (
    <div className="px-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
          Memory Media
        </h2>
        <span className="text-[11px] text-ink-500">{photos.length} items</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {photos.map((p) => (
          <PhotoCard key={p.photo_id} photo={p} />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({ photo }: { photo: PhotoAnalysis }) {
  return (
    <div className="flex flex-col">
      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm">
        {photo.imageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.imageDataUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <PlaceholderTile description={photo.description} />
        )}
      </div>
      <div className="px-0.5 py-1.5">
        <div className="text-[12px] font-medium text-ink-800 line-clamp-2 leading-snug">
          {photo.description}
        </div>
      </div>
    </div>
  );
}

function PlaceholderTile({ description }: { description: string }) {
  const hue = hashHue(description);
  return (
    <div
      className="absolute inset-0 bg-gradient-to-br juni-grain"
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 40% 88%), hsl(${
          (hue + 40) % 360
        } 40% 78%))`,
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
        <div className="text-[9px] uppercase tracking-widest text-ink-500">
          placeholder
        </div>
        <div className="mt-1 text-[10px] text-ink-700 line-clamp-4 leading-snug">
          {description.split(/[.,]/).slice(0, 2).join(", ")}
        </div>
      </div>
    </div>
  );
}

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 360;
}
