"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import type {
  ConquestRegion,
  ConquestTerritory,
  Team,
  EventLog,
  TeamPlayerBreakdown,
} from "@/lib/types/v2";

const TOTAL_TASKS = 45;

interface ConquestScoreboardProps {
  eventId: string;
  teams: Team[];
  territories: ConquestTerritory[];
  regions: ConquestRegion[];
  selectedTeamId: string | null;
  onSelectedTeamIdChange: (id: string | null) => void;
}

const RANK_STYLES: Record<
  number,
  { bg: string; color: string; border: string }
> = {
  1: {
    bg: "rgba(212,164,74,0.14)",
    color: "#d4a44a",
    border: "rgba(212,164,74,0.4)",
  },
  2: {
    bg: "rgba(169,163,179,0.10)",
    color: "#a9a3b3",
    border: "rgba(169,163,179,0.3)",
  },
  3: {
    bg: "rgba(176,116,68,0.12)",
    color: "#b07444",
    border: "rgba(176,116,68,0.35)",
  },
};

export function ConquestScoreboard({
  eventId,
  teams,
  territories,
  regions,
  selectedTeamId,
  onSelectedTeamIdChange,
}: ConquestScoreboardProps) {
  const { data: logs = [] } = useQuery<EventLog[]>({
    queryKey: ["conquest-logs", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/conquest/${eventId}/logs?per_page=1000`);
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data ?? []);
    },
    staleTime: 10_000,
    refetchInterval: 10_000,
  });

  const uniqueTasksByTeam = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const log of logs) {
      if (
        log.type === "CHALLENGE_COMPLETED" &&
        log.meta?.unique &&
        log.team_id &&
        log.entity_id
      ) {
        if (!map.has(log.team_id)) map.set(log.team_id, new Set());
        map.get(log.team_id)!.add(log.entity_id);
      }
    }
    return map;
  }, [logs]);

  const sorted = useMemo(
    () => [...teams].sort((a, b) => b.points - a.points),
    [teams],
  );
  const maxPts = Math.max(...sorted.map((t) => t.points), 1);

  const selectedTeam = selectedTeamId
    ? (teams.find((t) => t.id === selectedTeamId) ?? null)
    : null;

  return (
    <aside
      className="flex flex-col rounded-2xl overflow-hidden h-120 bg-card border border-white/10 shadow-[0_0_0_1px_rgba(0,0,0,0.4)_inset,0_20px_50px_-30px_rgba(0,0,0,0.8)]"
    >
      {selectedTeam ? (
        <TeamDetail
          eventId={eventId}
          team={selectedTeam}
          territories={territories}
          regions={regions}
          uniqueTasks={uniqueTasksByTeam.get(selectedTeam.id)?.size ?? 0}
          onBack={() => onSelectedTeamIdChange(null)}
        />
      ) : (
        <TeamList
          sorted={sorted}
          maxPts={maxPts}
          territories={territories}
          regions={regions}
          onSelect={onSelectedTeamIdChange}
        />
      )}
    </aside>
  );
}

function TeamList({
  sorted,
  maxPts,
  territories,
  regions,
  onSelect,
}: {
  sorted: Team[];
  maxPts: number;
  territories: ConquestTerritory[];
  regions: ConquestRegion[];
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div
        className="flex items-center justify-between px-4.5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="text-sm font-semibold uppercase">Standings</div>
      </div>

      <div className="py-1.5 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground/50">
            No teams yet
          </div>
        ) : (
          sorted.map((team, index) => {
            const rank = index + 1;
            const rankStyle = RANK_STYLES[rank] ?? {
              bg: "rgba(255,255,255,0.04)",
              color: "var(--muted-foreground)",
              border: "rgba(255,255,255,0.06)",
            };
            const territoriesHeld = territories.filter(
              (t) => t.controlling_team_id === team.id,
            ).length;
            const regionsHeld = regions.filter(
              (r) => r.controlling_team_id === team.id,
            ).length;
            const isLast = index === sorted.length - 1;

            return (
              <button
                key={team.id}
                onClick={() => onSelect(team.id)}
                className="relative w-full grid items-center gap-3 px-4.5 pt-3 pb-5 text-left transition-colors hover:bg-white/[0.04] grid-cols-[28px_40px_1fr_auto] cursor-pointer"
                style={{
                  borderBottom: isLast
                    ? undefined
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Rank badge */}
                <div
                  className="size-6 rounded-lg grid place-items-center text-sm font-semibold shrink-0"
                  style={{
                    background: rankStyle.bg,
                    color: rankStyle.color,
                    border: `1px solid ${rankStyle.border}`,
                  }}
                >
                  {rank}
                </div>

                {/* Team avatar */}
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.10)" }}
                >
                  {team.image_url ? (
                    <Image
                      src={team.image_url}
                      alt={team.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: team.color ?? "#888" }}
                    />
                  )}
                </div>

                {/* Team name + breakdown */}
                <div className="min-w-0">
                  <div className="font-semibold text-base truncate leading-snug">
                    {team.name}
                  </div>
                  <div className="flex flex-col text-xs font-mono text-muted-foreground leading-relaxed mt-0.5">
                    {territoriesHeld > 0 && (
                      <span>{territoriesHeld} territories</span>
                    )}
                    {regionsHeld > 0 && <span>{regionsHeld} regions</span>}
                    {territoriesHeld === 0 && regionsHeld === 0 && (
                      <span className="opacity-50">No territories yet</span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <div
                    className="text-2xl font-semibold tabular-nums leading-none"
                    style={rank === 1 ? { color: "#d4a44a" } : undefined}
                  >
                    {team.points.toLocaleString()}
                  </div>
                  <div className="text-xs uppercase text-muted-foreground mt-1 font-mono">
                    PTS
                  </div>
                </div>

                {/* Score bar */}
                <div className="absolute bottom-1.5 left-4.5 right-4.5 h-0.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(team.points / maxPts) * 100}%`,
                      background: team.color
                        ? `linear-gradient(to right, ${team.color}88, ${team.color})`
                        : "linear-gradient(to right, #e63946, #ff5560)",
                    }}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}

function TeamDetail({
  eventId,
  team,
  territories,
  regions,
  uniqueTasks,
  onBack,
}: {
  eventId: string;
  team: Team;
  territories: ConquestTerritory[];
  regions: ConquestRegion[];
  uniqueTasks: number;
  onBack: () => void;
}) {
  const territoriesHeld = territories.filter(
    (t) => t.controlling_team_id === team.id,
  ).length;
  const ownedRegions = regions.filter((r) => r.controlling_team_id === team.id);
  const color = team.color ?? "#888";

  const { data: allTeamActions = [] } = useQuery<TeamPlayerBreakdown[]>({
    queryKey: ["conquest-player-actions", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/conquest/${eventId}/player-actions`);
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data ?? []);
    },
    staleTime: 10_000,
    refetchInterval: 10_000,
  });

  const teamData = allTeamActions.find((t) => t.team_id === team.id);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 text-lg leading-none cursor-pointer"
          aria-label="Back to standings"
        >
          ←
        </button>
        <div
          className="w-9 h-9 rounded-lg overflow-hidden shrink-0"
          style={{ border: `1px solid ${color}55` }}
        >
          {team.image_url ? (
            <Image
              src={team.image_url}
              alt={team.name}
              width={36}
              height={36}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full" style={{ background: color }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm truncate leading-tight">
            {team.name}
          </div>
          <div
            className="text-lg font-semibold tabular-nums leading-tight"
            style={{ color }}
          >
            {team.points.toLocaleString()}{" "}
            <span className="text-xs text-muted-foreground font-mono">PTS</span>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div
        className="grid grid-cols-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {[
          { label: "Territories", value: territoriesHeld },
          { label: "Regions", value: ownedRegions.length },
          { label: "Tasks", value: `${uniqueTasks}/${TOTAL_TASKS}` },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className="flex flex-col items-center py-3 gap-0.5"
            style={{
              borderRight:
                i < 2 ? "1px solid rgba(255,255,255,0.06)" : undefined,
            }}
          >
            <div
              className="text-xl font-semibold tabular-nums leading-none"
              style={{ color }}
            >
              {value}
            </div>
            <div className="text-[0.6rem] uppercase text-muted-foreground font-mono">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable players + actions */}
      <div className="flex-1 overflow-y-auto">
        {teamData && teamData.players.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {teamData.players.map((player) => (
              <div key={player.player_name} className="pt-2.5 pb-1.5">
                <div className="flex items-center gap-1.5 px-4 mb-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-base font-semibold">
                    {player.player_name}
                  </span>
                </div>
                {player.actions.map((action) => (
                  <div
                    key={action.name}
                    className="flex items-center gap-2 px-4 pl-8 py-1"
                  >
                    <div
                      className="size-10 rounded shrink-0 overflow-hidden flex items-center justify-center bg-white/[0.04] border border-white/[0.08]"
                    >
                      {action.img_path ? (
                        <Image
                          src={action.img_path}
                          alt={action.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="object-contain p-0.5"
                        />
                      ) : (
                        <div className="size-1.5 rounded-full bg-white/20" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      {action.name}
                    </span>
                    <span
                      className="text-sm font-mono tabular-nums shrink-0"
                      style={{ color }}
                    >
                      {action.quantity.toLocaleString()}×
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground/40">
            No activity yet
          </div>
        )}
      </div>
    </div>
  );
}
