"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import type { RegionData } from "@/components/territory-map/types";
import type { RegionGroup } from "@/components/territory-map/map-data";
import { getGroupKey } from "@/components/territory-map/map-data";
import type {
  ConquestTerritory,
  Team,
  TerritoryProgressEntry,
} from "@/lib/types/v2";
import { TerritoryProofDialog } from "./TerritoryProofDialog";

// ── data fetchers ────────────────────────────────────────────────────────────

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
  const res = await fetch(
    `/api/conquest/territories/${territoryId}/progress`,
  );
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
}

// ── TerritoryDetailRow ───────────────────────────────────────────────────────

interface TerritoryDetailRowProps {
  territory: ConquestTerritory;
  teams: Team[];
  colorHex: string;
}

function TerritoryDetailRow({
  territory,
  teams,
  colorHex,
}: TerritoryDetailRowProps) {
  const { data: challenge } = useQuery({
    queryKey: ["conquest-challenge", territory.challenge_id],
    queryFn: () => fetchChallenge(territory.challenge_id!),
    enabled: !!territory.challenge_id,
    staleTime: Infinity,
  });

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

  const { data: progress = [] } = useQuery<TerritoryProgressEntry[]>({
    queryKey: ["territory-progress", territory.id],
    queryFn: () => fetchProgress(territory.id),
    staleTime: 15_000,
  });

  const triggerName: string | null =
    challenge?.trigger?.name ?? trigger?.name ?? triggerSlots[0]?.items[0]?.name ?? null;
  const triggerImgPath: string | null =
    challenge?.trigger?.img_path ?? trigger?.img_path ?? triggerSlots[0]?.items[0]?.img_path ?? null;
  const required: number | null = challenge?.quantity ?? null;
  const isOrChallenge = triggerSlots.length > 0;
  const taskName: string | null = challenge?.task?.name ?? null;

  const progressMap = new Map(progress.map((p) => [p.team_id, p]));

  const controllingTeam = territory.controlling_team_id
    ? teams.find((t) => t.id === territory.controlling_team_id)
    : null;

  return (
    <div
      className="relative rounded-xl overflow-hidden flex flex-col"
      style={{
        background: controllingTeam
          ? `linear-gradient(to right, ${controllingTeam.color ?? "#888"}18, hsl(var(--card)) 60%)`
          : "hsl(var(--card))",
        border: `1px solid ${controllingTeam ? `${controllingTeam.color ?? "#888"}44` : "rgba(255,255,255,0.10)"}`,
      }}
    >
      {/* Accent bar — team color when controlled, region color otherwise */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{
          background: controllingTeam?.color ?? colorHex,
          boxShadow: `0 0 10px ${controllingTeam?.color ?? colorHex}`,
        }}
      />

      {/* Territory label */}
      <div className="px-3 pt-2.5 pl-4 text-base text-foreground font-bold truncate flex items-baseline gap-1.5">
        <span className="truncate">{taskName ?? territory.name}</span>
        {required != null && required > 1 && (
          <span className="text-sm text-muted-foreground font-normal shrink-0">×{required}</span>
        )}
      </div>

      {/* Header */}
      <div
        className="flex items-start gap-2 px-3 py-2.5 pl-4 flex-1"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {isOrChallenge ? (
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
<div className="flex flex-wrap gap-3">
              {triggerSlots.map((slot, i) =>
                slot.items.length === 1 ? (
                  slot.items[0].img_path ? (
                    <div key={i} className="relative shrink-0" title={slot.items[0].name}>
                      <div
                        className="size-16 rounded-md overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
                      >
                        <Image src={slot.items[0].img_path} alt={slot.items[0].name} fill unoptimized className="object-contain p-1.5" />
                      </div>
                      {required != null && required > 1 && (
                        <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-[10px] font-bold shadow-md">
                          {slot.items[0].value}
                        </div>
                      )}
                    </div>
                  ) : null
                ) : (
                  <div key={i} className="flex gap-1">
                    {slot.items.map((item, j) =>
                      item.img_path ? (
                        <div key={j} className="relative shrink-0" title={item.name}>
                          <div
                            className="size-16 rounded overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
                          >
                            <Image src={item.img_path} alt={item.name} fill unoptimized className="object-contain p-1.5" />
                          </div>
                          {required != null && required > 1 && (
                            <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-[10px] font-bold shadow-md">
                              {item.value}
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
          <>
            {/* Trigger image */}
            <div className="relative shrink-0">
              <div
                className="size-16 rounded-md overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                {triggerImgPath ? (
                  <Image
                    src={triggerImgPath}
                    alt={triggerName ?? territory.name}
                    fill
                    unoptimized
                    className="object-contain p-1.5"
                  />
                ) : (
                  <div
                    className="size-3 rounded-full opacity-30"
                    style={{ background: colorHex }}
                  />
                )}
              </div>
              {required != null && required > 1 && (
                <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-[10px] font-bold shadow-md">
                  {challenge?.value}
                </div>
              )}
            </div>

            {required != null && required !== 1 && (
              <div className="text-muted-foreground text-xs">× {required}</div>
            )}
          </>
        )}
      </div>

      {/* Team progress */}
      <div className="pl-4 flex flex-wrap">
        {teams.map((team, i) => {
          const entry = progressMap.get(team.id);
          const qty = entry?.quantity ?? 0;
          const completions = entry?.completions ?? 0;
          const isController = territory.controlling_team_id === team.id;
          const label = required != null ? `${qty}/${required}` : `${completions}×`;
          const color = team.color ?? "#888";

          const inner = (
            <div className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <div
                  className="size-12 rounded-lg shrink-0 overflow-hidden relative"
                  style={{ border: `1px solid ${isController ? `${color}88` : "rgba(255,255,255,0.10)"}` }}
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
                    <div className="w-full h-full" style={{ background: color }} />
                  )}
                </div>
                <span
                  className="text-base font-mono tabular-nums leading-none"
                  style={{ color: isController ? color : "rgba(255,255,255,0.55)" }}
                >
                  {label}
                </span>
              </div>
            </div>
          );

          return (
            <div key={team.id} className="flex items-center">
              <TerritoryProofDialog
                territoryId={territory.id}
                teamId={team.id}
                triggerName={triggerName}
              >
                {inner}
              </TerritoryProofDialog>
              {i < teams.length - 1 && (
                <div className="w-px self-stretch bg-white/[0.06]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ConquestRegionDetail ─────────────────────────────────────────────────────

interface ConquestRegionDetailProps {
  group: RegionGroup;
  regionData: RegionData[];
  territories: ConquestTerritory[];
  teams: Team[];
  colorHex: string;
  onBack: () => void;
}

export function ConquestRegionDetail({
  group,
  regionData,
  territories,
  teams,
  colorHex,
  onBack,
}: ConquestRegionDetailProps) {
  const groupRegionData = regionData.filter(
    (rd) => getGroupKey(rd.name) === group.key,
  );
  const groupTerritoryIds = new Set(
    groupRegionData.flatMap((rd) => rd.territories.map((t) => t.id)),
  );
  const groupTerritories = territories
    .filter((t) => groupTerritoryIds.has(t.id))
    .sort(
      (a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999),
    );

  const sortedTeams = [...teams].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <section>
      {/* Section header */}
      <div
        className="flex items-center gap-3 pb-3.5 mb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs uppercase font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M9 2 L4 7 L9 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All Regions
        </button>
        <span className="text-muted-foreground/30">/</span>
        <h3
          className="font-semibold uppercase"
          style={{ color: colorHex }}
        >
          {group.displayName}
        </h3>
      </div>

      {/* Territory rows */}
      <div className="grid grid-cols-2 gap-3">
        {groupTerritories.length === 0 ? (
          <div
            className="rounded-xl py-10 text-center text-sm text-muted-foreground/40"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            No territories found
          </div>
        ) : (
          groupTerritories.map((t) => (
            <TerritoryDetailRow
              key={t.id}
              territory={t}
              teams={sortedTeams}
              colorHex={colorHex}
            />
          ))
        )}
      </div>
    </section>
  );
}
