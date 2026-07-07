"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ConquestRegion,
  ConquestTerritory,
  Team,
  TerritoryProgressEntry,
} from "@/lib/types/v2";
import type { RegionData } from "@/components/territory-map/types";
import { REGION_GROUPS, getGroupKey } from "@/components/territory-map/map-data";
import { TerritoryBreakdownDialog } from "./TerritoryBreakdownDialog";

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

function ImageWithLoader({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative size-full">
      {!loaded && <Skeleton className="absolute inset-0 rounded" />}
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-contain p-0.5"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

interface TerritoryTableRowProps {
  territory: ConquestTerritory;
  teams: Team[];
  isLast: boolean;
}

function TerritoryTableRow({ territory, teams, isLast }: TerritoryTableRowProps) {
  const { data: challenge, isPending: challengePending } = useQuery({
    queryKey: ["conquest-challenge", territory.challenge_id],
    queryFn: () => fetchChallenge(territory.challenge_id!),
    enabled: !!territory.challenge_id,
    staleTime: Infinity,
  });

  const triggerId = challenge?.trigger?.id ?? challenge?.trigger_id ?? null;
  const { data: trigger } = useQuery({
    queryKey: ["conquest-trigger", triggerId],
    queryFn: () => fetchTrigger(triggerId!),
    enabled: !!triggerId && !challenge?.trigger?.name,
    staleTime: Infinity,
  });

  type TriggerItem = { name: string; img_path: string | null; quantity: number | null; value: number | null; minPerAction: number | null };
  function childToItems(c: TriggerItem & { trigger?: TriggerItem; children?: unknown[] }): TriggerItem[] {
    if (c.trigger) return [{ name: c.trigger.name, img_path: c.trigger.img_path ?? null, quantity: c.quantity ?? null, value: (c as { value?: number | null }).value ?? null, minPerAction: (c as { min_quantity_per_action?: number | null }).min_quantity_per_action ?? null }];
    if (c.children?.length) return (c.children as typeof c[]).flatMap(childToItems);
    return [];
  }
  const triggerSlots: Array<{ items: TriggerItem[] }> =
    !triggerId && challenge?.children?.length > 0
      ? (challenge.children as Parameters<typeof childToItems>[0][]).map((c) => ({ items: childToItems(c) })).filter((s) => s.items.length > 0)
      : [];
  const isOrChallenge = triggerSlots.length > 0;
  const isPointWeighted = triggerSlots.some((slot) => slot.items.some((item) => (item.value ?? 1) > 1));

  const triggerName = challenge?.trigger?.name ?? trigger?.name ?? triggerSlots[0]?.items[0]?.name ?? territory.name;
  const triggerImgPath = challenge?.trigger?.img_path ?? trigger?.img_path ?? triggerSlots[0]?.items[0]?.img_path ?? null;
  const required = challenge?.quantity ?? null;

  const { data: progress = [], isPending: progressPending } = useQuery<TerritoryProgressEntry[]>({
    queryKey: ["territory-progress", territory.id],
    queryFn: () => fetchProgress(territory.id),
    staleTime: 15_000,
  });

  const rowStyle = { borderBottom: isLast ? undefined : "1px solid rgba(255,255,255,0.04)" };

  if (challengePending || progressPending) {
    return (
      <tr style={rowStyle}>
        <td className="px-4 py-2.5 sticky left-0" style={{ background: "hsl(var(--card))" }}>
          <Skeleton className="h-4 w-24 mb-1" />
          <div className="hidden sm:flex items-center gap-2.5">
            <Skeleton className="size-16 rounded shrink-0" />
            <Skeleton className="h-4 w-32" />
          </div>
        </td>
        {teams.map((team) => (
          <td key={team.id} className="py-2.5 text-center">
            <Skeleton className="h-4 w-8 mx-auto" />
          </td>
        ))}
      </tr>
    );
  }

  const progressMap = new Map(progress.map((p) => [p.team_id, p]));
  const taskName: string | null = challenge?.task?.name ?? null;

  return (
    <tr style={rowStyle}>
      <td className="px-4 py-2.5 sticky left-0" style={{ background: "hsl(var(--card))" }}>
        {/* Task name + required multiplier */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-base font-medium text-foreground">
            {taskName ?? territory.name}
          </span>
          {required != null && required > 1 && (
            <span className="text-xs text-muted-foreground/50 shrink-0">
              ×{required}
            </span>
          )}
        </div>
        {isOrChallenge ? (
          <div className="hidden sm:flex flex-wrap gap-2">
            {triggerSlots.map((slot, i) =>
                slot.items.length === 1 ? (
                  slot.items[0].img_path ? (
                    <div key={i} className="relative shrink-0" title={slot.items[0].name}>
                      <div className="size-16 relative rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <ImageWithLoader src={slot.items[0].img_path} alt={slot.items[0].name} />
                        {slot.items[0].minPerAction != null && slot.items[0].minPerAction > 1 && (
                          <div
                            className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-amber-600/70 border-t border-amber-400 text-white text-xs font-bold py-0.5 leading-none"
                            title={`Only a drop of ${slot.items[0].minPerAction} of this item will count`}
                          >
                            {slot.items[0].minPerAction}
                          </div>
                        )}
                        {slot.items[0].quantity != null && slot.items[0].quantity > 1 && (
                          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-stability/50 border-t border-stability text-white text-xs font-bold py-0.5 leading-none">
                            req: {slot.items[0].quantity}
                          </div>
                        )}
                      </div>
                      {isPointWeighted && (
                        <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-xs font-bold shadow-md">
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
                          <div className="size-16 relative rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <ImageWithLoader src={item.img_path} alt={item.name} />
                            {item.minPerAction != null && item.minPerAction > 1 && (
                              <div
                                className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-amber-600/70 border-t border-amber-400 text-white text-xs font-bold py-0.5 leading-none"
                                title={`Only a drop of ${item.minPerAction} of this item will count`}
                              >
                                {item.minPerAction}
                              </div>
                            )}
                            {item.quantity != null && item.quantity > 1 && (
                              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-stability/50 border-t border-stability text-white text-xs font-bold py-0.5 leading-none">
                                req: {item.quantity}
                              </div>
                            )}
                          </div>
                          {isPointWeighted && (
                            <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-xs font-bold shadow-md">
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
        ) : (
          <div className="hidden sm:flex items-center gap-2">
              <div className="relative shrink-0">
                <div
                  className="size-16 rounded overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {triggerImgPath ? (
                    <ImageWithLoader src={triggerImgPath} alt={triggerName} />
                  ) : (
                    <div className="size-2 rounded-full bg-white/20 absolute inset-0 m-auto" />
                  )}
                  {challenge?.min_quantity_per_action != null &&
                    challenge.min_quantity_per_action > 1 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-amber-600/70 border-t border-amber-400 text-white text-xs font-bold py-0.5 leading-none"
                        title={`Only a drop of ${challenge.min_quantity_per_action} of this item will count`}
                      >
                        {challenge.min_quantity_per_action}
                      </div>
                    )}
                </div>
                {required != null && required > 1 && (
                  <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-xs font-bold shadow-md">
                    {challenge?.value}
                  </div>
                )}
              </div>
            </div>
        )}
      </td>
      {teams.map((team) => {
        const entry = progressMap.get(team.id);
        const qty = entry?.quantity ?? 0;
        const completions = entry?.completions ?? 0;
        const isController = territory.controlling_team_id === team.id;
        // For multi-leaf challenges the backend score lives in `completions`; `quantity` is raw aggregate
        const displayQty = isOrChallenge ? completions : qty;
        // Lead with full completions; keep the raw total as a dim secondary.
        const fullCompletions =
          required != null && required > 1
            ? Math.floor(displayQty / required)
            : null;
        const label =
          required == null
            ? `${completions}×`
            : required === 1
              ? `${displayQty}`
              : `${fullCompletions}`;
        const color = team.color ?? "#888";
        const hasProgress = displayQty > 0;

        const tdContent = (
          <div className="flex flex-col items-center gap-1">
            {isController && (
              <div
                className="size-1.5 rounded-full"
                style={{ background: color, boxShadow: `0 0 6px ${color}` }}
              />
            )}
            <span className="relative leading-none">
              <span
                className="block text-2xl font-mono font-semibold tabular-nums leading-none"
                style={{ color: hasProgress ? color : "rgba(255,255,255,0.25)" }}
              >
                {label}
              </span>
              {fullCompletions != null && displayQty > 0 && (
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 text-sm font-normal text-muted-foreground leading-none">
                  {displayQty}
                </span>
              )}
            </span>
          </div>
        );

        return (
          <TerritoryBreakdownDialog
            key={team.id}
            territoryId={territory.id}
            teamId={team.id}
            challenge={challenge}
            trigger={trigger}
            teamProgress={entry}
          >
            <td
              className="py-2.5 text-center cursor-pointer transition-colors hover:bg-white/[0.06]"
              style={isController ? { background: `${color}0d` } : undefined}
            >
              {tdContent}
            </td>
          </TerritoryBreakdownDialog>
        );
      })}
    </tr>
  );
}

interface ConquestTerritoryTableProps {
  territories: ConquestTerritory[];
  teams: Team[];
  regions: ConquestRegion[];
  regionData: RegionData[];
}

export function ConquestTerritoryTable({
  territories,
  teams,
  regions,
  regionData,
}: ConquestTerritoryTableProps) {
  // Order regions to match the region cards: REGION_GROUPS order, then the
  // regionData entries within each group (by their region_id, first wins).
  const regionOrder = new Map<string, number>();
  let orderIdx = 0;
  for (const group of REGION_GROUPS) {
    for (const rd of regionData.filter(
      (r) => getGroupKey(r.name) === group.key,
    )) {
      if (rd.region_id && !regionOrder.has(rd.region_id)) {
        regionOrder.set(rd.region_id, orderIdx++);
      }
    }
  }

  const grouped = regions
    .map((region) => ({
      region,
      territories: territories
        .filter((t) => t.region_id === region.id)
        .sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999)),
    }))
    .filter((g) => g.territories.length > 0)
    .sort(
      (a, b) =>
        (regionOrder.get(a.region.id) ?? Infinity) -
        (regionOrder.get(b.region.id) ?? Infinity),
    );

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
  const teamColPct = (40 / sortedTeams.length).toFixed(2) + "%";

  return (
    <div
      className="rounded-xl overflow-auto"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <table className="w-full sm:min-w-[560px] border-collapse" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "60%" }} />
          {sortedTeams.map((team) => (
            <col key={team.id} style={{ width: teamColPct }} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <th
              className="px-4 py-3 text-left text-xs uppercase font-mono text-muted-foreground/50 font-medium sticky left-0"
              style={{ background: "hsl(var(--card))" }}
            >
              Territory
            </th>
            {sortedTeams.map((team) => (
              <th key={team.id} className="px-3 py-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="size-7 rounded overflow-hidden shrink-0 relative"
                    style={{ border: "1px solid rgba(255,255,255,0.10)" }}
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
                      <div className="w-full h-full" style={{ background: team.color ?? "#888" }} />
                    )}
                  </div>
                  <span
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: team.color ?? "rgba(255,255,255,0.6)" }}
                  >
                    {team.name}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grouped.map(({ region, territories: regionTerritories }) => (
            <>
              <tr
                key={`region-${region.id}`}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <td
                  colSpan={sortedTeams.length + 1}
                  className="px-4 py-2 sticky left-0"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <span className="text-sm uppercase font-mono font-medium text-muted-foreground/40 tracking-wider">
                    {region.name}
                  </span>
                </td>
              </tr>
              {regionTerritories.map((t, i) => (
                <TerritoryTableRow
                  key={t.id}
                  territory={t}
                  teams={sortedTeams}
                  isLast={i === regionTerritories.length - 1}
                />
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
