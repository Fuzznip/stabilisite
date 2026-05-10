"use client";

import Image from "next/image";
import type { ConquestRegion, ConquestTerritory, Team } from "@/lib/types/v2";

interface ConquestScoreboardProps {
  teams: Team[];
  territories: ConquestTerritory[];
  regions: ConquestRegion[];
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
  teams,
  territories,
  regions,
}: ConquestScoreboardProps) {
  const sorted = [...teams].sort((a, b) => b.points - a.points);
  const maxPts = Math.max(...sorted.map((t) => t.points), 1);

  return (
    <aside
      className="flex flex-col rounded-2xl overflow-hidden h-full"
      style={{
        background:
          "linear-gradient(to bottom, hsl(var(--card)), hsl(var(--card)))",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "0 0 0 1px rgba(0,0,0,0.4) inset, 0 20px 50px -30px rgba(0,0,0,0.8)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4.5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="text-sm font-semibold tracking-[0.22em] uppercase [font-family:var(--font-cinzel)]">
          Standings
        </div>
      </div>

      {/* Team rows */}
      <div className="py-1.5">
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
              <div
                key={team.id}
                className="relative grid items-center gap-3 px-4.5 pt-3 pb-5 transition-colors hover:bg-white/[0.02] grid-cols-[28px_40px_1fr_auto]"
                style={{
                  borderBottom: isLast
                    ? undefined
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Rank badge */}
                <div
                  className="size-6 rounded-lg grid place-items-center text-sm font-semibold [font-family:var(--font-cinzel)] shrink-0"
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
                  <div className="flex flex-col text-xs font-mono tracking-[0.04em] text-muted-foreground leading-relaxed mt-0.5">
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
                    className="text-2xl font-semibold tabular-nums leading-none [font-family:var(--font-cinzel)]"
                    style={rank === 1 ? { color: "#d4a44a" } : undefined}
                  >
                    {team.points.toLocaleString()}
                  </div>
                  <div className="text-xs tracking-[0.16em] uppercase text-muted-foreground mt-1 font-mono">
                    PTS
                  </div>
                </div>

                {/* Score bar */}
                <div
                  className="absolute bottom-1.5 left-4.5 right-4.5 h-0.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
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
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
