import Image from "next/image";
import { CircleHelp } from "lucide-react";
import { REGION_GROUPS, REGION_COLORS, getGroupKey } from "./map-data";
import type { RegionData } from "./types";
import type { ConquestRegion, Team } from "@/lib/types/v2";

interface MapLegendProps {
  regionData: RegionData[];
  regions: ConquestRegion[];
  teams: Team[];
}

export function MapLegend({ regionData, regions, teams }: MapLegendProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full mt-4">
      {REGION_GROUPS.map((group, i) => {
        const groupRegionData = regionData.filter((rd) => getGroupKey(rd.name) === group.key);
        const conquestRegions = groupRegionData.map((rd) => regions.find((r) => r.id === rd.region_id));
        const ownerIds = new Set(conquestRegions.map((r) => r?.controlling_team_id ?? null));
        const ownerId = ownerIds.size === 1 ? [...ownerIds][0] : null;
        const owner = ownerId ? teams.find((t) => t.id === ownerId) : null;
        const color = `rgb(${REGION_COLORS[i].join(",")})`;

        return (
          <div
            key={group.key}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: color }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground leading-tight">
                {group.displayName}
              </span>
              {owner ? (
                <span className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  {owner.image_url ? (
                    <Image
                      src={owner.image_url}
                      alt={owner.name}
                      width={16}
                      height={16}
                      unoptimized
                      className="rounded-full object-cover shrink-0"
                      style={{ border: `1.5px solid ${owner.color ?? "#6b7280"}` }}
                    />
                  ) : (
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ background: owner.color ?? "#6b7280" }}
                    />
                  )}
                  {owner.name}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <CircleHelp className="w-3.5 h-3.5 shrink-0" />
                  Uncontrolled
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
