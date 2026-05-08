"use client";

import { useCallback, useEffect, useState } from "react";
import type { RegionData, OverlayBuffer, HoverState, HoverInfo } from "./types";
import type { ViewTransform } from "./useMapPanZoom";
import { getGroupDisplayName } from "./map-data";

export function useMapInteraction({
  canvasRef,
  regionData,
  overlayBuffersRef,
  setHoverState,
  transformRef,
  isDraggingRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  regionData: RegionData[];
  overlayBuffersRef: React.RefObject<Record<string, OverlayBuffer>>;
  setHoverState: (state: HoverState | null) => void;
  transformRef: React.RefObject<ViewTransform>;
  isDraggingRef: React.RefObject<boolean>;
}) {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const hitTest = useCallback(
    (mx: number, my: number): { regionName: string; label: number } | null => {
      for (const rd of regionData) {
        const lx = Math.floor(mx - rd.offsetX);
        const ly = Math.floor(my - rd.offsetY);
        if (lx < 0 || ly < 0 || lx >= rd.imageWidth || ly >= rd.imageHeight)
          continue;

        const buf = overlayBuffersRef.current[rd.name];
        if (!buf) continue;

        // Red channel of label PNG: 0=sea, N=territory index (1-based)
        const label = buf.labelData[ly * rd.imageWidth + lx];
        if (label > 0) return { regionName: rd.name, label };
      }
      return null;
    },
    [regionData, overlayBuffersRef]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onMouseMove(e: MouseEvent) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Suppress territory hover while the user is panning
      if (isDraggingRef.current) return;

      setMousePos({ x: e.clientX, y: e.clientY });

      const rect = canvas.getBoundingClientRect();
      const cssToCanvas = canvas.width / rect.width;
      // Canvas-pixel position, then inverse the pan/zoom transform → world coords
      const cp_x = (e.clientX - rect.left) * cssToCanvas;
      const cp_y = (e.clientY - rect.top) * cssToCanvas;
      const { scale, x: tx, y: ty } = transformRef.current;
      const mx = (cp_x - tx) / scale;
      const my = (cp_y - ty) / scale;

      const hit = hitTest(mx, my);

      if (hit) {
        setHoverState(hit);
        const rd = regionData.find((r) => r.name === hit.regionName);
        const territory = rd?.territories.find((t) => t.index === hit.label);
        if (rd && territory) {
          setHoverInfo({
            regionDisplayName: getGroupDisplayName(rd.name),
            territoryName: territory.name,
            territoryId: territory.id,
          });
        }
        canvas.style.cursor = "pointer";
      } else {
        setHoverState(null);
        setHoverInfo(null);
        canvas.style.cursor = transformRef.current.scale > 1 ? "grab" : "default";
      }
    }

    function onMouseLeave() {
      setHoverState(null);
      setHoverInfo(null);
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = "default";
      // Pan/zoom will restore "grab" cursor if needed via its own pointerleave handler
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [canvasRef, regionData, hitTest, setHoverState, transformRef, isDraggingRef]);

  return { hoverInfo, mousePos };
}
