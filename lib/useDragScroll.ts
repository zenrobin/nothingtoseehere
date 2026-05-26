"use client";

import { useEffect, useRef } from "react";

/**
 * Makes a horizontally scrollable element draggable with a mouse.
 * - Touch scrolls natively (we don't interfere).
 * - Mouse drag pans the element.
 * - If the user dragged more than a small threshold, the click that would
 *   normally fire on a child button is swallowed.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = 0;
    let pointerId: number | null = null;
    let lastDragEndAt = 0;
    const DRAG_THRESHOLD = 5;

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      isDown = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startScroll = el!.scrollLeft;
      moved = 0;
      el!.style.cursor = "grabbing";
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDown) return;
      const dx = e.clientX - startX;
      moved = Math.abs(dx);
      if (moved > DRAG_THRESHOLD) {
        el!.scrollLeft = startScroll - dx;
      }
    }

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      pointerId = null;
      el!.style.cursor = "";
      if (moved > DRAG_THRESHOLD) {
        lastDragEndAt = Date.now();
      }
    }

    function onClickCapture(e: MouseEvent) {
      if (Date.now() - lastDragEndAt < 200) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);
    el.style.cursor = "grab";

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
      el.style.cursor = "";
    };
  }, []);

  return ref;
}
