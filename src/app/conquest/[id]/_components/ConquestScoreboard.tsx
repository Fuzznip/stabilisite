"use client";

import type { ConquestRegion, ConquestTerritory, Team } from "@/lib/types/v2";

interface ConquestScoreboardProps {
  teams: Team[];
  territories: ConquestTerritory[];
  regions: ConquestRegion[];
}

const POINTS = {
  territory: 10,
  region: 50,
  greenLog: 15,
} as const;

export function ConquestScoreboard({
  teams,
  territories,
  regions,
}: ConquestScoreboardProps) {
  const sorted = [...teams].sort((a, b) => b.points - a.points);

  return (
    <div className="flex flex-col gap-2 w-56 flex-shrink-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
        Scoreboard
      </h2>
      <div className="flex flex-col gap-1">
        {sorted.map((team, rank) => {
          const territoriesControlled = territories.filter(
            (t) => t.controlling_team_id === team.id
          ).length;
          const regionsControlled = regions.filter(
            (r) => r.controlling_team_id === team.id
          ).length;
          const greenLogs = regions.filter((r) =>
            r.green_logged_teams.includes(team.id)
          ).length;

          return (
            <div
              key={team.id}
              className="rounded-md border border-stone-700/50 bg-stone-800/60 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-stone-500 text-xs w-4 text-right flex-shrink-0">
                  {rank + 1}.
                </span>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-stone-100 text-sm font-semibold flex-1 min-w-0 truncate">
                  {team.name}
                </span>
                <span className="text-amber-400 text-sm font-bold flex-shrink-0">
                  {team.points.toLocaleString()}
                </span>
              </div>

              <div className="mt-1.5 ml-6 flex flex-col gap-0.5">
                {territoriesControlled > 0 && (
                  <BreakdownRow
                    label="Territories"
                    count={territoriesControlled}
                    pts={territoriesControlled * POINTS.territory}
                  />
                )}
                {regionsControlled > 0 && (
                  <BreakdownRow
                    label="Regions"
                    count={regionsControlled}
                    pts={regionsControlled * POINTS.region}
                  />
                )}
                {greenLogs > 0 && (
                  <BreakdownRow
                    label="Green logs"
                    count={greenLogs}
                    pts={greenLogs * POINTS.greenLog}
                  />
                )}
                {territoriesControlled === 0 &&
                  regionsControlled === 0 &&
                  greenLogs === 0 && (
                    <span className="text-stone-600 text-[0.65rem]">
                      No territories yet
                    </span>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  count,
  pts,
}: {
  label: string;
  count: number;
  pts: number;
}) {
  return (
    <div className="flex items-center justify-between text-[0.65rem]">
      <span className="text-stone-400">
        {count} {label}
      </span>
      <span className="text-stone-500">+{pts}pt</span>
    </div>
  );
}
