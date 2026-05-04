"use client";

import { useMemo } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { TerritoryMap } from "@/components/territory-map/TerritoryMap";
import { useConquestSSE } from "../_hooks/useConquestSSE";
import type { RegionData } from "@/components/territory-map/types";
import type { ConquestTerritory, TeamWithMembers } from "@/lib/types/v2";

const queryClient = new QueryClient();

interface ConquestClientWrapperProps {
  eventId: string;
  regionData: RegionData[];
  initialTerritories: ConquestTerritory[];
  teams: TeamWithMembers[];
}

export function ConquestClientWrapper(props: ConquestClientWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConquestMapInner {...props} />
    </QueryClientProvider>
  );
}

function ConquestMapInner({
  eventId,
  regionData,
  initialTerritories,
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

  // Flatten TeamWithMembers to Team for the map (map only needs id, color, etc.)
  const flatTeams = useMemo(() => teams.map(({ members: _m, ...t }) => t), [teams]);

  return (
    <TerritoryMap
      regionData={regionData}
      conquestTerritories={territories}
      teams={flatTeams}
    />
  );
}
