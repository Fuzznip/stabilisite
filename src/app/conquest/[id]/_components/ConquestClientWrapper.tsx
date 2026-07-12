"use client";

import { useMemo, useState, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const TerritoryMap = dynamic(
  () =>
    import("@/components/territory-map/TerritoryMap").then(
      (m) => m.TerritoryMap,
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="w-full aspect-[459/211] lg:aspect-auto lg:h-full rounded-[18px]" />
    ),
  },
);
import { StaticTerritoryMap } from "@/components/territory-map/StaticTerritoryMap";
import { ConquestScoreboard } from "./ConquestScoreboard";
import { ConquestRegions } from "./ConquestRegions";
import { ConquestActivity } from "./ConquestActivity";
import { ConquestTerritoryTable } from "./ConquestTerritoryTable";
import type { RegionData } from "@/components/territory-map/types";
import type {
  ConquestRegion,
  ConquestTerritory,
  Event,
  EventLog,
  TeamWithMembers,
} from "@/lib/types/v2";

const queryClient = new QueryClient();

interface ConquestClientWrapperProps {
  event: Event;
  regionData: RegionData[];
  initialTerritories: ConquestTerritory[];
  initialRegions: ConquestRegion[];
  teams: TeamWithMembers[];
  initialLogs: EventLog[];
  playerCount: number;
}

export function ConquestClientWrapper(props: ConquestClientWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConquestInner {...props} />
    </QueryClientProvider>
  );
}

function formatCountdown(endDateIso: string, now: Date): string | null {
  const diff = new Date(endDateIso).getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}D`);
  if (hours > 0 || days > 0) parts.push(`${hours}H`);
  parts.push(`${minutes}M`);
  return parts.join(" ");
}

function ConquestInner({
  event,
  regionData,
  initialTerritories,
  initialRegions,
  teams,
  initialLogs,
  playerCount,
}: ConquestClientWrapperProps) {
  const { data: territories = initialTerritories ?? [] } = useQuery({
    queryKey: ["conquest-territories", event?.id],
    queryFn: async () => {
      const res = await fetch(`/api/conquest/${event.id}/territories`);
      const json = await res.json();
      return (json.data ?? []) as ConquestTerritory[];
    },
    initialData: initialTerritories ?? [],
    staleTime: 10_000,
    refetchInterval: 10_000,
  });

  const { data: regions = initialRegions ?? [] } = useQuery({
    queryKey: ["conquest-regions", event?.id],
    queryFn: async () => {
      const res = await fetch(`/api/conquest/${event.id}/regions`);
      const json = await res.json();
      return (json.data ?? []) as ConquestRegion[];
    },
    initialData: initialRegions ?? [],
    staleTime: 10_000,
    refetchInterval: 10_000,
  });

  const { data: liveTeams = teams } = useQuery({
    queryKey: ["conquest-teams", event?.id],
    queryFn: async () => {
      const res = await fetch(`/api/conquest/${event.id}/teams`);
      const json = await res.json();
      return (json.data ?? []) as TeamWithMembers[];
    },
    initialData: teams,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });

  const PER_PAGE = 20;

  const { data: logs = initialLogs } = useQuery({
    queryKey: ["conquest-activity", event?.id],
    queryFn: async () => {
      const res = await fetch(
        `/api/conquest/${event.id}/logs?per_page=${PER_PAGE}`,
      );
      const json = await res.json();
      return (json.data ?? []) as EventLog[];
    },
    initialData: initialLogs,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });

  const [extraLogs, setExtraLogs] = useState<EventLog[]>([]);
  const [nextPage, setNextPage] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);
  // Assume there may be more until we get back a partial page
  const [hasMore, setHasMore] = useState(true);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/conquest/${event.id}/logs?per_page=${PER_PAGE}&page=${nextPage}`,
      );
      const json = await res.json();
      const page = (json.data ?? []) as EventLog[];
      const existingIds = new Set([...logs, ...extraLogs].map((l) => l.id));
      const newLogs = page.filter((l) => !existingIds.has(l.id));
      setExtraLogs((prev) => [...prev, ...newLogs]);
      setNextPage((p) => p + 1);
      setHasMore(page.length >= PER_PAGE);
    } finally {
      setLoadingMore(false);
    }
  }

  const allLogs = [
    ...logs,
    ...extraLogs.filter((l) => !logs.some((ll) => ll.id === l.id)),
  ];

  const flatTeams = useMemo(
    () =>
      liveTeams.map(({ members: _m, ...t }) => ({
        ...t,
        members: [] as string[],
        image_url:
          t.image_url ??
          `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=${encodeURIComponent(t.color?.replace("#", "") ?? "888888")}&textColor=ffffff&fontSize=40`,
      })),
    [liveTeams],
  );

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const countdown = formatCountdown(event.end_date, now);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Hero */}
      <header className="flex items-end justify-between gap-4 sm:gap-8 flex-wrap">
        <div>
          <div className="flex items-center gap-4 mb-2.5">
            {countdown ? (
              <span className="text-xs uppercase text-muted-foreground font-mono">
                ENDS IN{" "}
                <strong className="text-foreground font-semibold">
                  {countdown}
                </strong>
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold uppercase leading-none">
            {event.name}
          </h1>
        </div>

        {playerCount > 0 && (
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <div className="text-2xl sm:text-[28px] font-semibold tabular-nums leading-none">
              {playerCount}
            </div>
            <div className="text-xs uppercase text-muted-foreground font-mono">
              Players
            </div>
          </div>
        )}
      </header>

      {/* Main grid: map (flex-1) + standings (fixed 340px).
          The interactive Leaflet map doesn't size/interact reliably on mobile,
          so below lg we swap it for a non-interactive static canvas render. */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_340px] items-stretch">
        {/* Interactive map — large screens */}
        <div className="hidden lg:block lg:h-full">
          <TerritoryMap
            event={event}
            regionData={regionData}
            conquestTerritories={territories}
            teams={flatTeams}
            regions={regions}
            hideTitle
            hideLegend
            fillHeight
            highlightTeamId={selectedTeamId}
            activeGroupKey={selectedGroupKey}
            onGroupKeyChange={setSelectedGroupKey}
          />
        </div>
        {/* Static map — mobile / tablet */}
        <div className="lg:hidden">
          <StaticTerritoryMap
            regionData={regionData}
            conquestTerritories={territories}
            teams={flatTeams}
          />
        </div>
        <ConquestScoreboard
          eventId={event.id}
          teams={flatTeams}
          territories={territories}
          regions={regions}
          selectedTeamId={selectedTeamId}
          onSelectedTeamIdChange={setSelectedTeamId}
        />
      </div>

      {/* Regions / Table tabs */}
      <Tabs defaultValue="regions">
        <div
          className="flex items-center justify-between pb-3.5 mb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h3 className="font-semibold uppercase">Regions</h3>
          <TabsList className="h-8 px-0.5">
            <TabsTrigger value="regions" className="text-sm h-7 px-5">
              Regions
            </TabsTrigger>
            <TabsTrigger value="table" className="text-sm h-7 px-5">
              Table
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="regions" className="mt-0">
          <ConquestRegions
            regions={regions}
            territories={territories}
            teams={flatTeams}
            regionData={regionData}
            selectedGroupKey={selectedGroupKey}
            onSelectedGroupKeyChange={setSelectedGroupKey}
          />
        </TabsContent>
        <TabsContent value="table" className="mt-0">
          <ConquestTerritoryTable
            territories={territories}
            teams={flatTeams}
            regions={regions}
            regionData={regionData}
          />
        </TabsContent>
      </Tabs>

      {/* Recent activity */}
      <ConquestActivity
        logs={allLogs}
        teams={flatTeams}
        territories={territories}
        regions={regions}
        loadingMore={loadingMore}
      />
      {hasMore && !loadingMore && allLogs.length > 0 && (
        <Button
          onClick={loadMore}
          className="w-fit mx-auto px-8 cursor-pointer bg-stability text-white hover:bg-stability/90"
        >
          Load more
        </Button>
      )}
    </div>
  );
}
