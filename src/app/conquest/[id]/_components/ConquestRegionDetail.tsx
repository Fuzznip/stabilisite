"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import type { RegionData } from "@/components/territory-map/types";
import type { RegionGroup } from "@/components/territory-map/map-data";
import { getGroupKey } from "@/components/territory-map/map-data";
import type {
  ConquestRegion,
  ConquestTerritory,
  Team,
  TerritoryProgressEntry,
  TerritoryProofEntry,
} from "@/lib/types/v2";
import { TerritoryProofDialog } from "./TerritoryProofDialog";
import { PointsBadge } from "./PointsBadge";

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
  const res = await fetch(`/api/conquest/territories/${territoryId}/progress`);
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
}

// All teams' proofs for a territory in one call (team_id omitted); each entry
// carries its own team_id so we can tally per-team, per-trigger client-side.
async function fetchProofs(
  territoryId: string,
): Promise<TerritoryProofEntry[]> {
  const res = await fetch(`/api/conquest/territories/${territoryId}/proofs`);
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
  type TriggerItem = {
    name: string;
    img_path: string | null;
    quantity: number | null;
    value: number | null;
    minPerAction: number | null;
    countPerAction: number | null;
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
          countPerAction: c.count_per_action ?? null,
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

  const { data: progress = [] } = useQuery<TerritoryProgressEntry[]>({
    queryKey: ["territory-progress", territory.id],
    queryFn: () => fetchProgress(territory.id),
    staleTime: 15_000,
  });

  // Selecting a team reveals its per-trigger tallies (fetched lazily on select).
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [proofTrigger, setProofTrigger] = useState<TriggerItem | null>(null);
  const [proofOpen, setProofOpen] = useState(false);

  const { data: allProofs = [] } = useQuery<TerritoryProofEntry[]>({
    queryKey: ["territory-proofs", territory.id],
    queryFn: () => fetchProofs(territory.id),
    enabled: selectedTeamId != null,
    staleTime: 30_000,
  });

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
  const taskName: string | null = challenge?.task?.name ?? null;

  const progressMap = new Map(progress.map((p) => [p.team_id, p]));

  const controllingTeam = territory.controlling_team_id
    ? teams.find((t) => t.id === territory.controlling_team_id)
    : null;

  // Unified trigger list — the OR slots flattened, or the single trigger.
  const triggers: TriggerItem[] = isOrChallenge
    ? triggerSlots.flatMap((s) => s.items)
    : triggerName || triggerImgPath
      ? [
          {
            name: triggerName ?? territory.name,
            img_path: triggerImgPath,
            quantity: required,
            value: challenge?.value ?? 1,
            minPerAction: challenge?.min_quantity_per_action ?? null,
            countPerAction: challenge?.count_per_action ?? null,
          },
        ]
      : [];

  const selectedTeam = selectedTeamId
    ? (teams.find((t) => t.id === selectedTeamId) ?? null)
    : null;

  // How many of a given trigger a team has logged (proof deltas summed).
  // When count_per_action is set, each individual action contributes at most
  // that much (e.g. a drop of 2 with count_per_action=1 still only counts as 1).
  const triggerQtyForTeam = (
    teamId: string,
    name: string,
    countPerAction: number | null,
  ): number =>
    allProofs
      .filter(
        (p) =>
          p.team_id === teamId &&
          p.action?.name?.toLowerCase() === name.toLowerCase(),
      )
      .reduce((sum, p) => {
        const q = p.action?.quantity ?? 0;
        return sum + (countPerAction != null ? Math.min(q, countPerAction) : q);
      }, 0);

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden flex flex-col"
        style={{
          background: controllingTeam
            ? `linear-gradient(to right, ${controllingTeam.color ?? "#888"}33, hsl(var(--card)) 70%)`
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

        {/* Territory name */}
        <div className="px-4 pt-3 pb-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-foreground leading-tight">
            {taskName ?? territory.name}
          </span>
          {required != null && required > 1 && (
            <span className="text-sm text-muted-foreground font-normal shrink-0">
              ×{required}
            </span>
          )}
          <PointsBadge
            points={territory.points}
            className="ml-auto self-center"
          />
        </div>

        {/* Team progress — click a team to reveal its per-trigger tally below */}
        <div className="px-2 pb-2 flex flex-wrap">
          {teams.map((team) => {
            const entry = progressMap.get(team.id);
            const qty = entry?.quantity ?? 0;
            const completions = entry?.completions ?? 0;
            const displayQty = isOrChallenge ? completions : qty;
            // For multi-quantity challenges, lead with full completions and keep
            // the raw total as a secondary detail (e.g. "2 (5 total)").
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
            const isController = territory.controlling_team_id === team.id;
            const isSelected = selectedTeamId === team.id;
            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(isSelected ? null : team.id)}
                aria-pressed={isSelected}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.06]"
                style={isSelected ? { background: `${color}1f` } : undefined}
              >
                <div
                  className="size-14 rounded-lg shrink-0 overflow-hidden relative"
                  style={{
                    border: `1px solid ${
                      isSelected
                        ? color
                        : isController
                          ? `${color}88`
                          : "rgba(255,255,255,0.10)"
                    }`,
                    boxShadow: isSelected ? `0 0 0 1px ${color}` : undefined,
                  }}
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
                      style={{ background: color }}
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
                    <span className="absolute left-0 top-full mt-1 text-sm font-normal text-muted-foreground leading-none whitespace-nowrap">
                      {displayQty}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Triggers — reveal the selected team's amount on each */}
        {triggers.length > 0 && (
          <div
            className="px-4 pt-2.5 pb-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex flex-wrap gap-3">
              {triggers.map((trig, ti) => {
                const count = selectedTeam
                  ? triggerQtyForTeam(selectedTeam.id, trig.name, trig.countPerAction)
                  : 0;
                const color = selectedTeam?.color ?? "#888";
                const tile = (
                  <>
                    <div className="relative shrink-0">
                      <div
                        className="size-14 relative rounded-md overflow-hidden"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${count > 0 ? color : "rgba(255,255,255,0.10)"}`,
                        }}
                      >
                        {trig.img_path ? (
                          <Image
                            src={trig.img_path}
                            alt={trig.name}
                            fill
                            unoptimized
                            className="object-contain p-1.5"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="size-3 rounded-full opacity-30"
                              style={{ background: colorHex }}
                            />
                          </div>
                        )}
                        {trig.minPerAction != null && trig.minPerAction > 1 && (
                          <div
                            className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-amber-600/70 border-t border-amber-400 text-white text-sm font-bold py-0.5 leading-none"
                            title={`Only a drop of ${trig.minPerAction} of this item will count`}
                          >
                            {trig.minPerAction}
                          </div>
                        )}
                        {trig.quantity != null && trig.quantity > 1 && (
                          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-stability/50 border-t border-stability text-white text-sm font-bold py-0.5 leading-none">
                            req: {trig.quantity}
                          </div>
                        )}
                      </div>
                      {isPointWeighted && (
                        <div className="absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center bg-stability text-white text-sm font-bold shadow-md">
                          {trig.value ?? 1}
                        </div>
                      )}
                    </div>
                    <span
                      className="text-sm font-mono font-bold tabular-nums leading-none"
                      style={{
                        color: count > 0 ? color : "rgba(255,255,255,0.3)",
                        visibility: selectedTeam ? "visible" : "hidden",
                      }}
                    >
                      {count}
                    </span>
                  </>
                );
                return selectedTeam ? (
                  <button
                    key={ti}
                    title={trig.name}
                    onClick={() => {
                      setProofTrigger(trig);
                      setProofOpen(true);
                    }}
                    className="flex flex-col items-center gap-1 cursor-pointer"
                  >
                    {tile}
                  </button>
                ) : (
                  <div
                    key={ti}
                    title={trig.name}
                    className="flex flex-col items-center gap-1"
                  >
                    {tile}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedTeam && proofTrigger && (
        <TerritoryProofDialog
          territoryId={territory.id}
          teamId={selectedTeam.id}
          triggerName={proofTrigger.name}
          requiredQuantity={proofTrigger.quantity}
          filterByActionName={proofTrigger.name}
          open={proofOpen}
          onOpenChange={(v) => {
            setProofOpen(v);
            if (!v) setProofTrigger(null);
          }}
        />
      )}
    </>
  );
}

// ── ConquestRegionDetail ─────────────────────────────────────────────────────

interface ConquestRegionDetailProps {
  group: RegionGroup;
  regions: ConquestRegion[];
  regionData: RegionData[];
  territories: ConquestTerritory[];
  teams: Team[];
  colorHex: string;
  onBack: () => void;
}

export function ConquestRegionDetail({
  group,
  regions,
  regionData,
  territories,
  teams,
  colorHex,
  onBack,
}: ConquestRegionDetailProps) {
  const groupRegionData = regionData.filter(
    (rd) => getGroupKey(rd.name) === group.key,
  );
  const regionPoints = [
    ...new Set(
      groupRegionData
        .map((rd) => rd.region_id)
        .filter((rid): rid is string => Boolean(rid)),
    ),
  ]
    .map((rid) => regions.find((r) => r.id === rid))
    .filter((r): r is ConquestRegion => Boolean(r))
    .reduce((sum, r) => sum + (r.points ?? 0), 0);
  const groupTerritoryIds = new Set(
    groupRegionData.flatMap((rd) => rd.territories.map((t) => t.id)),
  );
  const groupTerritories = territories
    .filter((t) => groupTerritoryIds.has(t.id))
    .sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999));

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section>
      {/* Section header */}
      <div
        className="flex items-center gap-3 pb-3.5 mb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm uppercase font-mono text-muted-foreground hover:text-foreground transition-colors"
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
        <h3 className="font-semibold uppercase" style={{ color: colorHex }}>
          {group.displayName}
        </h3>
        {regionPoints > 0 && <PointsBadge points={regionPoints} />}
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
