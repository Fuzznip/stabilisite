"use client";

import { useMemo } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { TerritoryMap } from "@/components/territory-map/TerritoryMap";
import { ConquestScoreboard } from "./ConquestScoreboard";
import { useConquestSSE } from "../_hooks/useConquestSSE";
import type { RegionData } from "@/components/territory-map/types";
import type { ConquestRegion, ConquestTerritory, TeamWithMembers } from "@/lib/types/v2";

const queryClient = new QueryClient();

interface ConquestClientWrapperProps {
  eventId: string;
  regionData: RegionData[];
  initialTerritories: ConquestTerritory[];
  initialRegions: ConquestRegion[];
  teams: TeamWithMembers[];
}

export function ConquestClientWrapper(props: ConquestClientWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConquestInner {...props} />
    </QueryClientProvider>
  );
}

function ConquestInner({
  eventId,
  regionData,
  initialTerritories,
  initialRegions,
  teams,
}: ConquestClientWrapperProps) {
  useConquestSSE(eventId);

  const { data: territories = initialTerritories } = useQuery({
    queryKey: ["conquest-territories", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/conquest/${eventId}/territories`);
      const json = await res.json();
      return json.data as ConquestTerritory[];
    },
    initialData: initialTerritories,
    staleTime: 30_000,
  });

  const { data: regions = initialRegions } = useQuery({
    queryKey: ["conquest-regions", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/conquest/${eventId}/regions`);
      const json = await res.json();
      return json.data as ConquestRegion[];
    },
    initialData: initialRegions,
    staleTime: 30_000,
  });

  // Flatten TeamWithMembers → Team; members on conquest teams are TeamMember objects,
  // so we drop them and satisfy Team.members: string[] with an empty array.
  const flatTeams = useMemo(
    () =>
      teams.map(({ members: _m, ...t }) => ({
        ...t,
        members: [] as string[],
        image_url:
          t.image_url ??
          `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=${encodeURIComponent(t.color?.replace("#", "") ?? "888888")}&textColor=ffffff&fontSize=40`,
      })),
    [teams]
  );

  return (
    <div className="flex gap-6 items-start w-full">
      <div className="flex-1 min-w-0">
        <TerritoryMap
          regionData={regionData}
          conquestTerritories={territories}
          teams={flatTeams}
          regions={regions}
        />
      </div>
      <ConquestScoreboard
        teams={flatTeams}
        territories={territories}
        regions={regions}
      />
    </div>
  );
}
