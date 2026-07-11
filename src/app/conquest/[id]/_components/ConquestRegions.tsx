"use client";

import Image from "next/image";
import {
  REGION_GROUPS,
  REGION_COLORS,
  getGroupKey,
} from "@/components/territory-map/map-data";
import type { RegionData } from "@/components/territory-map/types";
import type { ConquestRegion, ConquestTerritory, Team } from "@/lib/types/v2";
import { ConquestRegionDetail } from "./ConquestRegionDetail";
import { PointsBadge } from "./PointsBadge";

interface ConquestRegionsProps {
  regions: ConquestRegion[];
  territories: ConquestTerritory[];
  teams: Team[];
  regionData: RegionData[];
  selectedGroupKey: string | null;
  onSelectedGroupKeyChange: (key: string | null) => void;
}

export function ConquestRegions({
  regions,
  territories,
  teams,
  regionData,
  selectedGroupKey,
  onSelectedGroupKeyChange: setSelectedGroupKey,
}: ConquestRegionsProps) {
  if (selectedGroupKey) {
    const groupIndex = REGION_GROUPS.findIndex(
      (g) => g.key === selectedGroupKey,
    );
    const group = REGION_GROUPS[groupIndex];
    const [r, g, b] = REGION_COLORS[groupIndex];
    const colorHex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    return (
      <ConquestRegionDetail
        group={group}
        regions={regions}
        regionData={regionData}
        territories={territories}
        teams={teams}
        colorHex={colorHex}
        onBack={() => setSelectedGroupKey(null)}
      />
    );
  }

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {REGION_GROUPS.map((group, i) => {
          const groupRegionData = regionData.filter(
            (rd) => getGroupKey(rd.name) === group.key,
          );
          const groupRegionIds = [
            ...new Set(
              groupRegionData.map((rd) => rd.region_id).filter(Boolean),
            ),
          ];

          const conquestRegions = groupRegionIds
            .map((rid) => regions.find((r) => r.id === rid))
            .filter(Boolean) as ConquestRegion[];

          const nonNullOwnerIds = [
            ...new Set(
              conquestRegions.map((r) => r.controlling_team_id).filter(Boolean),
            ),
          ];
          const isContested = nonNullOwnerIds.length > 1;
          const controllingTeamId =
            nonNullOwnerIds.length === 1 ? nonNullOwnerIds[0] : null;
          const owner = controllingTeamId
            ? teams.find((t) => t.id === controllingTeamId)
            : null;

          // Use regionData territories as the source of truth for pip count/order,
          // then join to conquest territories by ID to get ownership.
          // Only emit a pip if a matching DB territory actually exists.
          const groupTerritories = groupRegionData.flatMap((rd) =>
            rd.territories.flatMap((t) => {
              const ct = territories.find((ct) => ct.id === t.id);
              if (!ct) return [];
              const ctrl = ct.controlling_team_id
                ? teams.find((tm) => tm.id === ct.controlling_team_id)
                : null;
              return [{ id: t.id, ctrl: ctrl ?? null }];
            }),
          );

          // Sort pips grouped by team, controlling team first, then descending count, tiebreaker alphabetical
          const teamCounts = new Map<string, number>();
          for (const t of groupTerritories) {
            const key = t.ctrl?.id ?? "__none__";
            teamCounts.set(key, (teamCounts.get(key) ?? 0) + 1);
          }
          const teamRanks = new Map<string, number>();
          [...teamCounts.entries()]
            .filter(([key]) => key !== "__none__")
            .sort(([aId, aCount], [bId, bCount]) => {
              if (aId === controllingTeamId) return -1;
              if (bId === controllingTeamId) return 1;
              if (bCount !== aCount) return bCount - aCount;
              const aName = teams.find((t) => t.id === aId)?.name ?? "";
              const bName = teams.find((t) => t.id === bId)?.name ?? "";
              return aName.localeCompare(bName);
            })
            .forEach(([id], rank) => teamRanks.set(id, rank));
          groupTerritories.sort((a, b) => {
            const aKey = a.ctrl?.id ?? "__none__";
            const bKey = b.ctrl?.id ?? "__none__";
            if (aKey === "__none__" && bKey !== "__none__") return 1;
            if (aKey !== "__none__" && bKey === "__none__") return -1;
            return (teamRanks.get(aKey) ?? 999) - (teamRanks.get(bKey) ?? 999);
          });

          const regionPoints = conquestRegions.reduce(
            (sum, r) => sum + (r.points ?? 0),
            0,
          );

          const [r, g, b] = REGION_COLORS[i];
          const colorHex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

          return (
            <div
              key={group.key}
              onClick={() => setSelectedGroupKey(group.key)}
              className="relative flex flex-col gap-2.5 p-3.5 rounded-xl overflow-hidden transition-all hover:-translate-y-px cursor-pointer"
              style={
                {
                  background: owner
                    ? `linear-gradient(to right, ${owner.color ?? "#888"}33, hsl(var(--card)) 70%)`
                    : "hsl(var(--card))",
                  border: `1px solid ${owner ? `${owner.color ?? "#888"}44` : "rgba(255,255,255,0.10)"}`,
                  "--region-color": colorHex,
                } as React.CSSProperties
              }
            >
              {/* Accent bar — controlling team's color, gray if none */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                style={{
                  background: owner?.color ?? "#6b7280",
                  boxShadow: owner?.color ? `0 0 12px ${owner.color}` : "none",
                }}
              />

              <div className="flex items-center gap-2 pl-2">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ background: colorHex }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center flex-1 min-w-0 gap-1 sm:gap-2">
                  <span className="text-sm sm:text-base font-semibold uppercase leading-tight">
                    {group.displayName}
                  </span>
                  {regionPoints > 0 && (
                    <PointsBadge points={regionPoints} size="xs" className="sm:ml-auto w-fit" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pl-2">
                {owner ? (
                  <>
                    <div
                      className="size-6 rounded-md overflow-hidden shrink-0"
                      style={{ border: "1px solid rgba(255,255,255,0.10)" }}
                    >
                      {owner.image_url ? (
                        <Image
                          src={owner.image_url}
                          alt={owner.name}
                          width={24}
                          height={24}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: owner.color ?? "#888" }}
                        />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {owner.name}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground/60">
                    {isContested ? "Contested" : "Uncontrolled"}
                  </span>
                )}
              </div>

              {groupTerritories.length > 0 && (
                <div className="flex gap-1 pl-2">
                  {groupTerritories.map((t) => (
                    <div
                      key={t.id}
                      className="flex-1 h-1.5 rounded-full"
                      style={{
                        background: t.ctrl?.color ?? "rgba(255,255,255,0.06)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
