"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import type { HoverInfo } from "./types";
import type {
  ConquestTerritory,
  Team,
  TerritoryProgressEntry,
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

async function fetchProgress(
  territoryId: string,
): Promise<TerritoryProgressEntry[]> {
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
  const triggerId: string | null =
    challenge?.trigger?.id ?? challenge?.trigger_id ?? null;

  const { data: trigger } = useQuery({
    queryKey: ["conquest-trigger", triggerId],
    queryFn: () => fetchTrigger(triggerId!),
    enabled: !!triggerId && !challenge?.trigger?.name,
    staleTime: Infinity,
  });

  // For parent OR challenges, build slots from children.
  // Each slot is { items } — one item = standalone trigger, multiple = grouped grandchildren.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type TriggerItem = {
    name: string;
    img_path: string | null;
    quantity: number | null;
    value: number | null;
    minPerAction: number | null;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function childToItems(c: any): TriggerItem[] {
    if (c.trigger)
      return [
        {
          name: c.trigger.name,
          img_path: c.trigger.img_path ?? null,
          quantity: c.quantity ?? null,
          value: c.value ?? null,
          minPerAction: c.min_quantity_per_action ?? null,
        },
      ];
    if (c.children?.length) return (c.children as any[]).flatMap(childToItems);
    return [];
  }
  const triggerSlots: Array<{ items: TriggerItem[] }> =
    !triggerId && challenge?.children?.length > 0
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (challenge.children as any[])
          .map((c) => ({ items: childToItems(c) }))
          .filter((s) => s.items.length > 0)
      : [];

  const { data: progress = [] } = useQuery({
    queryKey: ["territory-progress", hover?.territoryId],
    queryFn: () => fetchProgress(hover!.territoryId),
    enabled: !!hover?.territoryId,
    staleTime: 15_000,
  });

  if (!hover) return null;

  const triggerName: string | null =
    challenge?.trigger?.name ??
    trigger?.name ??
    triggerSlots[0]?.items[0]?.name ??
    null;
  const triggerImgPath: string | null =
    challenge?.trigger?.img_path ??
    trigger?.img_path ??
    triggerSlots[0]?.items[0]?.img_path ??
    null;
  const required: number | null = challenge?.quantity ?? null;
  const isOrChallenge = triggerSlots.length > 0;
  const isPointWeighted = triggerSlots.some((slot) =>
    slot.items.some((item) => (item.value ?? 1) > 1),
  );

  // Sort by displayed progress desc (completions for OR challenges, else
  // raw quantity), falling back to completions as a tiebreaker.
  const sorted = [...progress].sort((a, b) => {
    const aQty = isOrChallenge ? a.completions : a.quantity;
    const bQty = isOrChallenge ? b.completions : b.quantity;
    return bQty - aQty || b.completions - a.completions;
  });

  // Unified trigger list — the OR slots flattened, or the single trigger.
  const triggers: TriggerItem[] = isOrChallenge
    ? triggerSlots.flatMap((s) => s.items)
    : triggerName || triggerImgPath
      ? [
          {
            name: triggerName ?? hover.territoryName,
            img_path: triggerImgPath,
            quantity: required,
            value: challenge?.value ?? 1,
            minPerAction: challenge?.min_quantity_per_action ?? null,
          },
        ]
      : [];

  return (
    <div
      className="fixed pointer-events-none z-[9999] bg-stone-900/95 border border-amber-700/60 rounded-lg shadow-xl w-[26rem]"
      style={{ left: mousePos.x + 20, top: mousePos.y - 14 }}
    >
      {/* Header — region + territory name */}
      <div className="px-4 py-3 border-b border-stone-700/60">
        <div className="text-stone-400 text-xs uppercase tracking-widest">
          {hover.regionDisplayName}
        </div>
        <div className="text-foreground text-sm flex items-baseline gap-2">
          <span className="truncate">{hover.territoryName}</span>
          {required != null && required > 1 && (
            <span className="text-stone-500 text-xs shrink-0">×{required}</span>
          )}
          {territory != null && (
            <span
              className="shrink-0 self-center inline-flex items-baseline gap-0.5 rounded font-mono font-semibold tabular-nums leading-none text-white px-1 py-0.5 text-sm"
              style={{
                background: "hsl(var(--stability) / 0.08)",
                border: "1px solid hsl(var(--stability))",
              }}
              title={`Worth ${territory.points} ${territory.points === 1 ? "point" : "points"}`}
            >
              {territory.points}
              <span className="font-normal opacity-70">pts</span>
            </span>
          )}
        </div>
      </div>

      {/* Team progress */}
      {sorted.length > 0 && (
        <div className="px-2 py-2 flex">
          {sorted.map((entry) => {
            const team = teams.find((t) => t.id === entry.team_id);
            const color = team?.color ?? "#6b7280";
            // For multi-leaf OR challenges the backend score lives in
            // `completions`; `quantity` is the raw aggregate.
            const displayQty = isOrChallenge
              ? entry.completions
              : entry.quantity;
            const fullCompletions =
              required != null && required > 1
                ? Math.floor(displayQty / required)
                : null;
            const label =
              required == null
                ? `${entry.completions}×`
                : required === 1
                  ? `${displayQty}`
                  : `${fullCompletions}`;
            const hasProgress = displayQty > 0;
            return (
              <div
                key={entry.team_id}
                className="flex-1 flex items-center justify-center gap-1.5 px-1 py-2 min-w-0"
              >
                <div
                  className="size-14 rounded-lg shrink-0 overflow-hidden relative"
                  style={{ border: `1px solid ${color}66` }}
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
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </div>
                <span className="relative leading-none">
                  <span
                    className="block text-2xl font-mono font-semibold tabular-nums leading-none"
                    style={{
                      color: hasProgress ? color : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {label}
                  </span>
                  {fullCompletions != null && displayQty > 0 && (
                    <span className="absolute left-0 top-full mt-1 text-sm font-normal text-stone-400 leading-none whitespace-nowrap">
                      {displayQty}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Triggers */}
      {triggers.length > 0 && (
        <div className="px-4 pt-2.5 pb-3 border-t border-stone-700/60">
          {isOrChallenge && (
            <div className="text-stone-500 text-xs uppercase tracking-widest mb-2">
              Any 1 of
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {triggers.map((trig, ti) => (
              <div key={ti} title={trig.name} className="relative shrink-0">
                <div className="size-14 relative rounded-md overflow-hidden bg-white/5 border border-white/10">
                  {trig.img_path ? (
                    <Image
                      src={trig.img_path}
                      alt={trig.name}
                      fill
                      unoptimized
                      className="object-contain p-1.5"
                    />
                  ) : null}
                  {trig.minPerAction != null && trig.minPerAction > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-amber-600/70 border-t border-amber-400 text-white text-xs font-bold py-0.5 leading-none">
                      {trig.minPerAction}
                    </div>
                  )}
                  {trig.quantity != null && trig.quantity > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-stability/50 border-t border-stability text-white text-xs font-bold py-0.5 leading-none">
                      req: {trig.quantity}
                    </div>
                  )}
                </div>
                {isPointWeighted && (
                  <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-xs font-bold shadow-md">
                    {trig.value ?? 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
