"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./map-data";

export interface ViewTransform {
  scale: number;
  x: number; // canvas-pixel offset
  y: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const ZOOM_FACTOR = 1.2;

function clampTransform(t: ViewTransform): ViewTransform {
  return {
    scale: t.scale,
    x: Math.max(-(t.scale - 1) * CANVAS_WIDTH, Math.min(0, t.x)),
    y: Math.max(-(t.scale - 1) * CANVAS_HEIGHT, Math.min(0, t.y)),
  };
}

/**
 * Adds mouse-wheel zoom (centered on cursor) and pointer-drag panning to the
 * canvas.  The transform is stored in `transformRef` for synchronous access by
 * the render loop and also reflected in `transform` state for React re-renders.
 */
export function useMapPanZoom(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  transformRef: React.MutableRefObject<ViewTransform>,
  markTransformDirty: () => void
) {
  const [transform, setTransform] = useState<ViewTransform>({ scale: 1, x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ px: number; py: number; tx: number; ty: number } | null>(null);

  const applyTransform = useCallback(
    (t: ViewTransform) => {
      transformRef.current = t;
      markTransformDirty();
      setTransform(t);
    },
    [transformRef, markTransformDirty]
  );

  // Wheel zoom toward cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const cssToCanvas = canvas.width / rect.width;
      // Cursor position in canvas-pixel space
      const cx = (e.clientX - rect.left) * cssToCanvas;
      const cy = (e.clientY - rect.top) * cssToCanvas;

      const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      const { scale, x, y } = transformRef.current;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));

      applyTransform(
        clampTransform({
          scale: newScale,
          x: cx - (cx - x) * (newScale / scale),
          y: cy - (cy - y) * (newScale / scale),
        })
      );

      // Update cursor
      if (canvas) {
        canvas.style.cursor = newScale > 1 ? "grab" : "default";
      }
    }

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [canvasRef, transformRef, applyTransform]);

  // Pointer drag to pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      isDraggingRef.current = true;
      canvas.style.cursor = "grabbing";
      dragStartRef.current = {
        px: e.clientX,
        py: e.clientY,
        tx: transformRef.current.x,
        ty: transformRef.current.y,
      };
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragStartRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const cssToCanvas = canvas.width / rect.width;
      const dx = (e.clientX - dragStartRef.current.px) * cssToCanvas;
      const dy = (e.clientY - dragStartRef.current.py) * cssToCanvas;

      applyTransform(
        clampTransform({
          ...transformRef.current,
          x: dragStartRef.current.tx + dx,
          y: dragStartRef.current.ty + dy,
        })
      );
    }

    function onPointerUp() {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      if (canvasRef.current) {
        canvasRef.current.style.cursor =
          transformRef.current.scale > 1 ? "grab" : "default";
      }
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
    };
  }, [canvasRef, transformRef, applyTransform]);

  // Double-click to reset
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onDblClick() {
      const reset: ViewTransform = { scale: 1, x: 0, y: 0 };
      applyTransform(reset);
      if (canvasRef.current) canvasRef.current.style.cursor = "default";
    }

    canvas.addEventListener("dblclick", onDblClick);
    return () => canvas.removeEventListener("dblclick", onDblClick);
  }, [canvasRef, applyTransform]);

  return { transform, isDraggingRef };
}
