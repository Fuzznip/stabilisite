"use client";

import { useQuery } from "@tanstack/react-query";
import type { HoverInfo } from "./types";
import type { ConquestTerritory, Team, TerritoryProgressEntry } from "@/lib/types/v2";

interface TerritoryHoverPanelProps {
  hover: HoverInfo | null;
  mousePos: { x: number; y: number };
  conquestTerritories: ConquestTerritory[];
  teams: Team[];
}

async function fetchChallenge(challengeId: string) {
  const res = await fetch(`/api/conquest/challenges/${challengeId}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchTrigger(triggerId: string) {
  const res = await fetch(`/api/conquest/triggers/${triggerId}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchProgress(territoryId: string): Promise<TerritoryProgressEntry[]> {
  const res = await fetch(`/api/conquest/territories/${territoryId}/progress`);
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
}

export function TerritoryHoverPanel({
  hover,
  mousePos,
  conquestTerritories,
  teams,
}: TerritoryHoverPanelProps) {
  const territory = hover
    ? conquestTerritories.find((t) => t.id === hover.territoryId)
    : null;

  const challengeId = territory?.challenge_id ?? null;

  const { data: challenge } = useQuery({
    queryKey: ["conquest-challenge", challengeId],
    queryFn: () => fetchChallenge(challengeId!),
    enabled: !!challengeId,
    staleTime: Infinity,
  });

  // If the challenge endpoint doesn't embed the trigger, fetch it separately
  const triggerId: string | null = challenge?.trigger?.id ?? challenge?.trigger_id ?? null;

  const { data: trigger } = useQuery({
    queryKey: ["conquest-trigger", triggerId],
    queryFn: () => fetchTrigger(triggerId!),
    enabled: !!triggerId && !challenge?.trigger?.name,
    staleTime: Infinity,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["territory-progress", hover?.territoryId],
    queryFn: () => fetchProgress(hover!.territoryId),
    enabled: !!hover?.territoryId,
    staleTime: 15_000,
  });

  if (!hover) return null;

  const triggerName: string | null =
    challenge?.trigger?.name ?? trigger?.name ?? null;
  const required: number | null = challenge?.quantity ?? null;

  // Sort progress by completions desc, then quantity desc
  const sorted = [...progress].sort(
    (a, b) => b.completions - a.completions || b.quantity - a.quantity
  );

  return (
    <div
      className="fixed pointer-events-none z-[9999] bg-stone-900/95 border border-amber-700/60 rounded-md shadow-xl w-56"
      style={{ left: mousePos.x + 16, top: mousePos.y - 10 }}
    >
      <div className="px-3 py-2 border-b border-stone-700/60">
        <div className="text-stone-400 text-[0.65rem] uppercase tracking-widest">
          {hover.regionDisplayName}
        </div>
        <div className="text-amber-400 font-semibold text-[0.82rem] tracking-wide leading-tight">
          {hover.territoryName}
        </div>
        {triggerName && (
          <div className="text-stone-300 text-[0.7rem] mt-0.5 leading-tight">
            {triggerName}
            {required != null && (
              <span className="text-stone-500 ml-1">× {required}</span>
            )}
          </div>
        )}
      </div>

      {sorted.length > 0 && (
        <div className="px-3 py-2 flex flex-col gap-1.5">
          {sorted.map((entry) => {
            const team = teams.find((t) => t.id === entry.team_id);
            const color = team?.color ?? "#6b7280";
            const pct =
              required != null && required > 0
                ? Math.min(1, entry.quantity / required)
                : entry.completions > 0
                ? 1
                : 0;

            return (
              <div key={entry.team_id}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-stone-300 text-[0.68rem] leading-none">
                      {team?.name ?? entry.team_name}
                    </span>
                  </div>
                  <span className="text-stone-400 text-[0.65rem]">
                    {required != null
                      ? `${entry.quantity}/${required}`
                      : `${entry.completions}×`}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-stone-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct * 100}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
