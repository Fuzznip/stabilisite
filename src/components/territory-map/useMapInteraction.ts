"use client";

import { useCallback, useEffect, useState } from "react";
import type { RegionData, OverlayBuffer, HoverState, HoverInfo } from "./types";
import { getGroupDisplayName } from "./map-data";

export function useMapInteraction({
  canvasRef,
  regionData,
  overlayBuffersRef,
  setHoverState,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  regionData: RegionData[];
  overlayBuffersRef: React.RefObject<Record<string, OverlayBuffer>>;
  setHoverState: (state: HoverState | null) => void;
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

      setMousePos({ x: e.clientX, y: e.clientY });

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);

      const hit = hitTest(mx, my);

      if (hit) {
        setHoverState(hit);
        const rd = regionData.find((r) => r.name === hit.regionName);
        const territory = rd?.territories[hit.label - 1]; // 1-based index
        if (rd && territory) {
          setHoverInfo({
            regionDisplayName: getGroupDisplayName(rd.name),
            territoryName: territory.name,
          });
        }
        canvas.style.cursor = "pointer";
      } else {
        setHoverState(null);
        setHoverInfo(null);
        canvas.style.cursor = "default";
      }
    }

    function onMouseLeave() {
      setHoverState(null);
      setHoverInfo(null);
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = "default";
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [canvasRef, regionData, hitTest, setHoverState]);

  return { hoverInfo, mousePos };
}
