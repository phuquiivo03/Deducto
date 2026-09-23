"use client";

import { useRef } from "react";

export default function useDrag(onMove: (x: number, y: number) => void) {
  const dragging = useRef(false);

  const start = useRef({
    x: 0,
    y: 0,
    ox: 0,
    oy: 0,
  });

  function pointerDown(e: React.PointerEvent, element: HTMLElement) {
    dragging.current = true;

    element.setPointerCapture(e.pointerId);

    start.current = {
      x: e.clientX,

      y: e.clientY,

      ox: element.offsetLeft,

      oy: element.offsetTop,
    };
  }

  function pointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;

    const dx = e.clientX - start.current.x;

    const dy = e.clientY - start.current.y;

    onMove(
      Math.max(0, start.current.ox + dx),

      Math.max(0, start.current.oy + dy),
    );
  }

  function pointerUp() {
    dragging.current = false;
  }

  return {
    pointerDown,

    pointerMove,

    pointerUp,
  };
}
