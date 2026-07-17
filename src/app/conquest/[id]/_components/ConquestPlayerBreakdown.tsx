"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import type { TeamPlayerBreakdown } from "@/lib/types/v2";

async function fetchPlayerActions(eventId: string): Promise<TeamPlayerBreakdown[]> {
  const res = await fetch(`/api/conquest/${eventId}/player-actions`);
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
}

export function ConquestPlayerBreakdown({ eventId }: { eventId: string }) {
  const { data: teams = [], isPending } = useQuery<TeamPlayerBreakdown[]>({
    queryKey: ["conquest-player-actions", eventId],
    queryFn: () => fetchPlayerActions(eventId),
    staleTime: 60_000,
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl h-48 animate-pulse"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
    );
  }

  const teamsWithActivity = teams.filter((t) => t.players.length > 0);

  if (teamsWithActivity.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground/50">
        No player activity recorded yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {teamsWithActivity.map((team) => (
        <TeamCard key={team.team_id} team={team} />
      ))}
    </div>
  );
}

function TeamCard({ team }: { team: TeamPlayerBreakdown }) {
  const color = team.team_color ?? "#888";

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {/* Team header */}
      <div
        className="flex items-center gap-3 px-4 py-3 relative"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}
        />
        <div
          className="size-11 rounded-lg overflow-hidden shrink-0"
          style={{ border: `1px solid ${color}55` }}
        >
          {team.team_image_url ? (
            <Image
              src={team.team_image_url}
              alt={team.team_name}
              width={44}
              height={44}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full" style={{ background: color }} />
          )}
        </div>
        <span className="font-semibold text-sm truncate">{team.team_name}</span>
        <span className="ml-auto text-xs text-muted-foreground/50 font-mono shrink-0">
          {team.players.length}p
        </span>
      </div>

      {/* Players */}
      <div className="divide-y divide-white/[0.04]">
        {team.players.map((player) => (
          <PlayerSection key={player.player_name} player={player} color={color} />
        ))}
      </div>
    </div>
  );
}

function PlayerSection({
  player,
  color,
}: {
  player: TeamPlayerBreakdown["players"][number];
  color: string;
}) {
  return (
    <div>
      {/* Player name row */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: color }}
          />
          <span className="text-sm font-medium font-mono">{player.player_name}</span>
        </div>
        <span className="text-xs text-muted-foreground/40 font-mono">
          {player.actions.reduce((s, a) => s + a.quantity, 0).toLocaleString()}
        </span>
      </div>

      {/* Action rows */}
      <div className="pb-1.5">
        {player.actions.map((action, i) => (
          <div
            key={action.name}
            className="flex items-center gap-2.5 px-4 py-1.5"
            style={
              i % 2 === 1
                ? { background: "rgba(255,255,255,0.025)" }
                : undefined
            }
          >
            {/* Item icon */}
            <div
              className="size-6 rounded shrink-0 overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {action.img_path ? (
                <Image
                  src={action.img_path}
                  alt={action.name}
                  width={24}
                  height={24}
                  unoptimized
                  className="object-contain p-0.5"
                />
              ) : (
                <div className="size-1.5 rounded-full bg-white/20" />
              )}
            </div>

            {/* Name */}
            <span className="text-xs text-muted-foreground flex-1 truncate">
              {action.name}
            </span>

            {/* Quantity */}
            <span
              className="text-xs font-mono tabular-nums shrink-0"
              style={{ color }}
            >
              {action.quantity.toLocaleString()}×
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
