"use client";

import Image from "next/image";
import { useQuery, useQueries } from "@tanstack/react-query";
import type { HoverInfo } from "./types";
import type {
  ConquestTerritory,
  Team,
  TerritoryProgressEntry,
  TerritoryProofEntry,
} from "@/lib/types/v2";

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

async function fetchProofs(
  territoryId: string,
  teamId: string
): Promise<TerritoryProofEntry[]> {
  const res = await fetch(
    `/api/conquest/territories/${territoryId}/proofs?team_id=${teamId}`
  );
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

  // For parent OR challenges, build slots from children.
  // Each slot is { items } — one item = standalone trigger, multiple = grouped grandchildren.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type TriggerItem = { name: string; img_path: string | null; quantity: number | null; value: number | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function childToItems(c: any): TriggerItem[] {
    if (c.trigger) return [{ name: c.trigger.name, img_path: c.trigger.img_path ?? null, quantity: c.quantity ?? null, value: c.value ?? null }];
    if (c.children?.length) return (c.children as any[]).flatMap(childToItems);
    return [];
  }
  const triggerSlots: Array<{ items: TriggerItem[] }> =
    !triggerId && challenge?.children?.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (challenge.children as any[]).map((c) => ({ items: childToItems(c) })).filter((s) => s.items.length > 0)
      : [];

  const { data: progress = [] } = useQuery({
    queryKey: ["territory-progress", hover?.territoryId],
    queryFn: () => fetchProgress(hover!.territoryId),
    enabled: !!hover?.territoryId,
    staleTime: 15_000,
  });

  // Per-team proofs — only needed for the multi-trigger matrix, where we show
  // each team's progress against every individual trigger.
  const isMultiTrigger = triggerSlots.length > 0;
  const teamProofQueries = useQueries({
    queries: teams.map((team) => ({
      queryKey: ["territory-proofs", hover?.territoryId, team.id],
      queryFn: () => fetchProofs(hover!.territoryId, team.id),
      enabled: !!hover?.territoryId && isMultiTrigger,
      staleTime: 30_000,
    })),
  });

  if (!hover) return null;

  const triggerName: string | null =
    challenge?.trigger?.name ?? trigger?.name ?? triggerSlots[0]?.items[0]?.name ?? null;
  const triggerImgPath: string | null =
    challenge?.trigger?.img_path ?? trigger?.img_path ?? triggerSlots[0]?.items[0]?.img_path ?? null;
  const required: number | null = challenge?.quantity ?? null;
  const isOrChallenge = triggerSlots.length > 0;
  const isPointWeighted = triggerSlots.some((slot) =>
    slot.items.some((item) => (item.value ?? 1) > 1)
  );

  // Sort by displayed progress desc (completions for OR challenges, else
  // raw quantity), falling back to completions as a tiebreaker.
  const sorted = [...progress].sort((a, b) => {
    const aQty = isOrChallenge ? a.completions : a.quantity;
    const bQty = isOrChallenge ? b.completions : b.quantity;
    return bQty - aQty || b.completions - a.completions;
  });

  // ── Matrix data (multi-trigger OR challenges) ──────────────────────────────
  const progressMap = new Map(progress.map((p) => [p.team_id, p]));
  // Flat list of individual triggers, one per matrix row.
  const matrixTriggers = triggerSlots.flatMap((s) => s.items);
  // Team columns, ordered by score so the leader sits leftmost.
  const columnTeams = [...teams].sort(
    (a, b) =>
      (progressMap.get(b.id)?.completions ?? 0) -
      (progressMap.get(a.id)?.completions ?? 0)
  );
  const teamProofs = new Map<string, TerritoryProofEntry[]>(
    teams.map((team, i) => [team.id, teamProofQueries[i]?.data ?? []])
  );
  // A trigger's proof actions record per-event deltas — sum them for the total.
  const triggerQtyForTeam = (teamId: string, triggerName: string): number =>
    (teamProofs.get(teamId) ?? [])
      .filter((p) => p.action?.name === triggerName)
      .reduce((sum, p) => sum + (p.action?.quantity ?? 0), 0);

  return (
    <div
      className={`fixed pointer-events-none z-[9999] bg-stone-900/95 border border-amber-700/60 rounded-lg shadow-xl ${
        isOrChallenge ? "w-96" : "w-80"
      }`}
      style={{ left: mousePos.x + 20, top: mousePos.y - 14 }}
    >
      <div className="px-4 py-3 border-b border-stone-700/60">
        <div className="text-stone-400 text-xs uppercase tracking-widest">
          {hover.regionDisplayName}
        </div>
        <div className="text-foreground text-xs mb-2">
          {hover.territoryName}
        </div>
        {!isOrChallenge && (
          <div className="flex items-center gap-3">
            {triggerImgPath && (
              <div className="relative shrink-0">
                <div className="size-16 relative rounded overflow-hidden bg-white/5 border border-white/10">
                  <Image
                    src={triggerImgPath}
                    alt={triggerName ?? hover.territoryName}
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                </div>
                {required != null && required > 1 && (
                  <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-[10px] font-bold shadow-md">
                    {challenge?.value}
                  </div>
                )}
              </div>
            )}
            {required != null && required !== 1 && (
              <div className="text-stone-500 text-xs">× {required}</div>
            )}
          </div>
        )}
      </div>

      {isOrChallenge ? (
        <div className="px-3 py-3">
          <div className="text-stone-500 text-[10px] uppercase tracking-widest mb-2 px-1">
            Any 1 of
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-0" />
                {columnTeams.map((team) => {
                  const color = team.color ?? "#6b7280";
                  return (
                    <th key={team.id} className="p-0 pb-2 w-9 align-bottom">
                      <div className="flex justify-center">
                        <div
                          className="size-6 rounded overflow-hidden relative"
                          style={{ border: `1px solid ${color}66` }}
                        >
                          {team.image_url ? (
                            <Image
                              src={team.image_url}
                              alt={team.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: color }}
                            />
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {matrixTriggers.map((trig, ti) => (
                <tr key={ti} className="border-t border-white/[0.06]">
                  <td className="py-1.5 pr-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {trig.img_path && (
                        <div className="relative size-7 shrink-0 rounded overflow-hidden bg-white/5 border border-white/10">
                          <Image
                            src={trig.img_path}
                            alt={trig.name}
                            fill
                            unoptimized
                            className="object-contain p-0.5"
                          />
                          {isPointWeighted && (
                            <div className="absolute -top-1 -left-1 size-3.5 rounded-full flex items-center justify-center bg-stability text-white text-[8px] font-bold shadow-md">
                              {trig.value ?? 1}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-stone-200 text-xs leading-tight truncate">
                          {trig.name}
                        </div>
                        {trig.quantity != null && trig.quantity > 1 && (
                          <div className="text-stone-500 text-[10px] leading-tight">
                            req {trig.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {columnTeams.map((team) => {
                    const qty = triggerQtyForTeam(team.id, trig.name);
                    const color = team.color ?? "#6b7280";
                    return (
                      <td key={team.id} className="text-center align-middle w-9">
                        <span
                          className="text-xs font-mono tabular-nums"
                          style={{
                            color: qty > 0 ? color : "rgba(255,255,255,0.28)",
                          }}
                        >
                          {qty > 0 ? qty : "·"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="pt-2 text-stone-500 text-[10px] uppercase tracking-widest">
                  {isPointWeighted ? "Points" : "Done"}
                </td>
                {columnTeams.map((team) => {
                  const total = progressMap.get(team.id)?.completions ?? 0;
                  const color = team.color ?? "#6b7280";
                  return (
                    <td key={team.id} className="pt-2 text-center w-9">
                      <span
                        className="text-xs font-mono font-bold tabular-nums"
                        style={{
                          color: total > 0 ? color : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {total}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        sorted.length > 0 && (
        <div className="px-4 py-3 flex flex-col gap-2.5">
          {sorted.map((entry) => {
            const team = teams.find((t) => t.id === entry.team_id);
            const color = team?.color ?? "#6b7280";
            // For multi-leaf OR challenges the backend score lives in
            // `completions`; `quantity` is the raw aggregate.
            const displayQty = isOrChallenge ? entry.completions : entry.quantity;
            const pct =
              required != null && required > 0
                ? Math.min(1, displayQty / required)
                : displayQty > 0
                ? 1
                : 0;
            const label =
              required == null
                ? `${entry.completions}×`
                : required === 1
                ? `${displayQty}`
                : `${displayQty}/${required}`;

            return (
              <div key={entry.team_id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-10 rounded shrink-0 overflow-hidden relative"
                      style={{ border: `1px solid ${color}40` }}
                    >
                      {team?.image_url ? (
                        <Image
                          src={team.image_url}
                          alt={team.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: color }} />
                      )}
                    </div>
                    <span className="text-stone-200 text-base font-medium leading-none">
                      {team?.name ?? entry.team_name}
                    </span>
                  </div>
                  <span className="text-stone-400 text-xs">{label}</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct * 100}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        )
      )}
    </div>
  );
}
