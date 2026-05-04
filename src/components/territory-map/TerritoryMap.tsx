"use client";

import type { RegionData } from "./types";
import type { ConquestTerritory, Team } from "@/lib/types/v2";
import { useMapRenderer } from "./useMapRenderer";
import { useMapInteraction } from "./useMapInteraction";
import { TerritoryMarkers } from "./TerritoryMarkers";
import { MapLegend } from "./MapLegend";
import { MapTooltip } from "./MapTooltip";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./map-data";

interface TerritoryMapProps {
  regionData: RegionData[];
  conquestTerritories: ConquestTerritory[];
  teams: Team[];
}

export function TerritoryMap({
  regionData,
  conquestTerritories,
  teams,
}: TerritoryMapProps) {
  const { canvasRef, overlayBuffersRef, setHoverState } = useMapRenderer(
    regionData,
    conquestTerritories,
    teams
  );

  const { hoverInfo, mousePos } = useMapInteraction({
    canvasRef,
    regionData,
    overlayBuffersRef,
    setHoverState,
  });

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-[80vw] mx-auto">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-[80vw] rounded shadow-lg ring-1 ring-amber-900/30"
          style={{ imageRendering: "pixelated" }}
        />
        {regionData.length > 0 && (
          <TerritoryMarkers regionData={regionData} canvasRef={canvasRef} />
        )}
      </div>
      <MapLegend />
      <MapTooltip hover={hoverInfo} mousePos={mousePos} />
    </div>
  );
}
