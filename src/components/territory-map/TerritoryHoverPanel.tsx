"use client";

import Image from "next/image";
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

  return (
    <div
      className="fixed pointer-events-none z-[9999] bg-stone-900/95 border border-amber-700/60 rounded-lg shadow-xl w-80"
      style={{ left: mousePos.x + 20, top: mousePos.y - 14 }}
    >
      <div className="px-4 py-3 border-b border-stone-700/60">
        <div className="text-stone-400 text-xs uppercase tracking-widest">
          {hover.regionDisplayName}
        </div>
        <div className="text-foreground text-xs mb-2">
          {hover.territoryName}
        </div>
        {isOrChallenge ? (
          <div className="flex flex-col gap-1.5">
            <div className="text-stone-500 text-xs uppercase tracking-widest">Any 1 of</div>
            <div className="flex flex-wrap gap-3">
              {triggerSlots.map((slot, i) =>
                slot.items.length === 1 ? (
                  slot.items[0].img_path ? (
                    <div key={i} className="relative shrink-0" title={slot.items[0].name}>
                      <div className="size-16 relative rounded overflow-hidden bg-white/5 border border-white/10">
                        <Image src={slot.items[0].img_path} alt={slot.items[0].name} fill unoptimized className="object-contain p-1" />
                        {slot.items[0].quantity != null && slot.items[0].quantity > 1 && (
                          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-stability/50 border-t border-stability text-white text-[10px] font-bold py-0.5 leading-none">
                            req: {slot.items[0].quantity}
                          </div>
                        )}
                      </div>
                      {isPointWeighted && (
                        <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-[10px] font-bold shadow-md">
                          {slot.items[0].value ?? 1}
                        </div>
                      )}
                    </div>
                  ) : null
                ) : (
                  <div key={i} className="flex gap-1">
                    {slot.items.map((item, j) =>
                      item.img_path ? (
                        <div key={j} className="relative shrink-0" title={item.name}>
                          <div className="size-16 relative rounded overflow-hidden bg-white/5 border border-white/10">
                            <Image src={item.img_path} alt={item.name} fill unoptimized className="object-contain p-1" />
                            {item.quantity != null && item.quantity > 1 && (
                              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-stability/50 border-t border-stability text-white text-[10px] font-bold py-0.5 leading-none">
                                req: {item.quantity}
                              </div>
                            )}
                          </div>
                          {isPointWeighted && (
                            <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-[10px] font-bold shadow-md">
                              {item.value ?? 1}
                            </div>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
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

      {sorted.length > 0 && (
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
      )}
    </div>
  );
}
