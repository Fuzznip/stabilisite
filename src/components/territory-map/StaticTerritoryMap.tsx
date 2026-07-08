"use client";

import { useRef } from "react";
import { useMapRenderer } from "./useMapRenderer";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./map-data";
import type { ViewTransform } from "./useMapPanZoom";
import type { RegionData } from "./types";
import type { ConquestTerritory, Team } from "@/lib/types/v2";

// Render at 2× the base map size so it stays crisp when scaled up to fill
// the container width on mobile.
const SCALE = 2;

interface StaticTerritoryMapProps {
  regionData: RegionData[];
  conquestTerritories: ConquestTerritory[];
  teams: Team[];
}

/**
 * Non-interactive map for small screens. Draws the whole map (region art +
 * per-team ownership colors) to a single canvas at a fixed transform — no
 * Leaflet, no pan/zoom/hover, so it renders reliably on mobile.
 */
export function StaticTerritoryMap({
  regionData,
  conquestTerritories,
  teams,
}: StaticTerritoryMapProps) {
  const transformRef = useRef<ViewTransform>({ scale: SCALE, x: 0, y: 0 });
  const { canvasRef } = useMapRenderer(
    regionData,
    conquestTerritories,
    teams,
    transformRef,
  );

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH * SCALE}
      height={CANVAS_HEIGHT * SCALE}
      className="w-full h-auto rounded-[18px]"
      style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
      aria-label="Territory map"
    />
  );
}
