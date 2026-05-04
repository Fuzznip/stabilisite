"use client";

import { useEffect, useState } from "react";
import { CircleHelp } from "lucide-react";
import type { RegionData } from "./types";

interface Marker {
  key: string;
  left: number;
  top: number;
}

export function TerritoryMarkers({
  regionData,
  canvasRef,
}: {
  regionData: RegionData[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function computeMarkers() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;

      const computed: Marker[] = [];
      for (const rd of regionData) {
        for (const t of rd.territories) {
          computed.push({
            key: `${rd.name}:${t.id}`,
            left: (rd.offsetX + t.cx) * scaleX,
            top: (rd.offsetY + t.cy) * scaleY,
          });
        }
      }
      setMarkers(computed);
    }

    computeMarkers();
    const observer = new ResizeObserver(computeMarkers);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef, regionData]);

  return (
    <>
      {markers.map((m) => (
        <div
          key={m.key}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none text-stone-300/75 drop-shadow-md"
          style={{ left: m.left, top: m.top }}
        >
          <CircleHelp size={16} />
        </div>
      ))}
    </>
  );
}
