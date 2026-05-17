"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from "@/components/territory-map/map-data";

const TerritoryMap = dynamic(
  () =>
    import("@/components/territory-map/TerritoryMap").then(
      (m) => m.TerritoryMap,
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton
        className="w-full rounded-[18px]"
        style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
      />
    ),
  },
);
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
  const { data: territories = initialTerritories } = useQuery({
    queryKey: ["conquest-territories", event?.id],
    queryFn: async () => {
      const res = await fetch(`/api/conquest/${event.id}/territories`);
      const json = await res.json();
      return json.data as ConquestTerritory[];
    },
    initialData: initialTerritories,
    staleTime: 30_000,
  });

  const { data: regions = initialRegions } = useQuery({
    queryKey: ["conquest-regions", event?.id],
    queryFn: async () => {
      const res = await fetch(`/api/conquest/${event.id}/regions`);
      const json = await res.json();
      return json.data as ConquestRegion[];
    },
    initialData: initialRegions,
    staleTime: 30_000,
  });

  const flatTeams = useMemo(
    () =>
      teams.map(({ members: _m, ...t }) => ({
        ...t,
        members: [] as string[],
        image_url:
          t.image_url ??
          `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=${encodeURIComponent(t.color?.replace("#", "") ?? "888888")}&textColor=ffffff&fontSize=40`,
      })),
    [teams],
  );

  const membersMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const team of teams) {
      map[team.id] = team.members as unknown as string[];
    }
    return map;
  }, [teams]);

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "table">("map");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const countdown = formatCountdown(event.end_date, now);

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <header className="flex items-end justify-between gap-8 flex-wrap">
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
          <h1 className="text-4xl font-semibold uppercase leading-none">
            {event.name}
          </h1>
        </div>

        {playerCount > 0 && (
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <div className="text-[28px] font-semibold tabular-nums leading-none">
              {playerCount}
            </div>
            <div className="text-xs uppercase text-muted-foreground font-mono">
              Players
            </div>
          </div>
        )}
      </header>

      {/* Main grid: map/table (flex-1) + standings (fixed 340px) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_340px]">
        <div className="relative">
          {/* Ellipsis menu — top-right corner of map */}
          <div className="absolute top-2 right-2 z-[9999]" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 rounded-lg py-1 z-50 min-w-[140px]"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                <button
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  onClick={() => {
                    setViewMode(viewMode === "map" ? "table" : "map");
                    setMenuOpen(false);
                  }}
                >
                  {viewMode === "map" ? "View in table" : "View map"}
                </button>
              </div>
            )}
          </div>

          {viewMode === "map" ? (
            <TerritoryMap
              event={event}
              regionData={regionData}
              conquestTerritories={territories}
              teams={flatTeams}
              regions={regions}
              hideTitle
              hideLegend
              highlightTeamId={selectedTeamId}
              activeGroupKey={selectedGroupKey}
              onGroupKeyChange={setSelectedGroupKey}
            />
          ) : (
            <ConquestTerritoryTable
              territories={territories}
              teams={flatTeams}
              regions={regions}
            />
          )}
        </div>
        <ConquestScoreboard
          eventId={event.id}
          teams={flatTeams}
          territories={territories}
          regions={regions}
          membersMap={membersMap}
          selectedTeamId={selectedTeamId}
          onSelectedTeamIdChange={setSelectedTeamId}
        />
      </div>

      {/* Region controllers */}
      <ConquestRegions
        regions={regions}
        territories={territories}
        teams={flatTeams}
        regionData={regionData}
        selectedGroupKey={selectedGroupKey}
        onSelectedGroupKeyChange={setSelectedGroupKey}
      />

      {/* Recent activity */}
      <ConquestActivity
        logs={initialLogs}
        teams={flatTeams}
        territories={territories}
        regions={regions}
      />
    </div>
  );
}
