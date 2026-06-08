"use client";

import React, { useMemo, useState } from "react";
import type { PhotoAnalysis } from "@/types";

interface Props {
  photos: PhotoAnalysis[];
  /** Called with the selected analyses when the user confirms. */
  onConfirm: (selected: PhotoAnalysis[]) => void;
  onCancel: () => void;
  initialSelectedIds?: number[];
}

/**
 * Mimics the iOS camera-roll picker: 3-column grid of square thumbnails,
 * blue selection ring + numbered chip on the active picks, a counter and
 * a Done button along the bottom. Pulls photos from the loaded memory ZIP
 * (settings.photoAnalyses) so the demo feels like the user's own library.
 */
export function CameraRollPicker({
  photos,
  onConfirm,
  onCancel,
  initialSelectedIds,
}: Props) {
  const [selected, setSelected] = useState<number[]>(initialSelectedIds ?? []);

  const photosWithThumb = useMemo(
    () => photos.filter((p) => !!p.imageDataUrl),
    [photos]
  );
  const placeholdersOnly = photosWithThumb.length === 0;

  function toggle(id: number) {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  }

  function confirm() {
    if (selected.length === 0) return;
    const ordered = selected
      .map((id) => photos.find((p) => p.photo_id === id))
      .filter((p): p is PhotoAnalysis => !!p);
    onConfirm(ordered);
  }

  return (
    <div className="absolute inset-0 z-[55] flex flex-col bg-white animate-slide-up">
      {/* Header */}
      <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-ink-100">
        <button
          onClick={onCancel}
          className="text-[14px] font-medium text-juni px-2 py-1"
        >
          Cancel
        </button>
        <div className="flex flex-col items-center">
          <div className="text-[13px] font-semibold text-ink-900 leading-tight">
            Recents
          </div>
          <div className="text-[10.5px] text-ink-500 leading-tight">
            {selected.length === 0
              ? "Select photos"
              : `${selected.length} selected`}
          </div>
        </div>
        <button
          onClick={confirm}
          disabled={selected.length === 0}
          className="text-[14px] font-semibold text-juni px-2 py-1 disabled:text-ink-300 disabled:cursor-not-allowed"
        >
          Done
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 scroll-area no-scrollbar bg-paper-warm/50">
        {placeholdersOnly ? (
          <div className="px-6 py-12 text-center text-[12.5px] text-ink-500">
            No photos in this memory yet. Upload a memory ZIP that includes
            <code className="mx-1 px-1 py-0.5 rounded bg-ink-100 text-[11px]">
              *-photos.json
            </code>
            so Juni can show your library here.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[2px] p-[2px]">
            {photosWithThumb.map((p) => {
              const idx = selected.indexOf(p.photo_id);
              const isSelected = idx !== -1;
              return (
                <button
                  key={p.photo_id}
                  onClick={() => toggle(p.photo_id)}
                  className="relative aspect-square overflow-hidden active:scale-[0.97] transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageDataUrl!}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover transition ${
                      isSelected ? "scale-95 brightness-95" : ""
                    }`}
                  />
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 ring-[3px] ring-juni" />
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-juni text-white text-[11px] font-bold grid place-items-center shadow-card">
                        {idx + 1}
                      </div>
                    </>
                  )}
                  {!isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 border-white/85 bg-black/15" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom action bar (iOS-ish summary) */}
      <div className="px-5 pt-3 pb-5 border-t border-ink-100 flex items-center justify-between bg-white">
        <div className="text-[12px] text-ink-500">
          {selected.length === 0
            ? "Tap photos to select"
            : `${selected.length} of ${photosWithThumb.length}`}
        </div>
        <button
          onClick={confirm}
          disabled={selected.length === 0}
          className="px-5 py-2.5 rounded-full bg-juni text-white text-[13px] font-semibold disabled:opacity-40 active:scale-[0.98]"
        >
          Use {selected.length || ""} {selected.length === 1 ? "photo" : "photos"}
        </button>
      </div>
    </div>
  );
}
