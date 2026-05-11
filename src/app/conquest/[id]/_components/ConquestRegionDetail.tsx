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

  const { data: progress = [] } = useQuery<TerritoryProgressEntry[]>({
    queryKey: ["territory-progress", territory.id],
    queryFn: () => fetchProgress(territory.id),
    staleTime: 15_000,
  });

  const triggerName: string | null =
    challenge?.trigger?.name ?? trigger?.name ?? null;
  const triggerImgPath: string | null =
    challenge?.trigger?.img_path ?? trigger?.img_path ?? null;
  const required: number | null = challenge?.quantity ?? null;

  const progressMap = new Map(progress.map((p) => [p.team_id, p]));

  const controllingTeam = territory.controlling_team_id
    ? teams.find((t) => t.id === territory.controlling_team_id)
    : null;

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {/* Accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ background: colorHex, boxShadow: `0 0 10px ${colorHex}` }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 pl-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Trigger image */}
        <div
          className="size-16 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          {triggerImgPath ? (
            <Image
              src={triggerImgPath}
              alt={triggerName ?? territory.name}
              width={64}
              height={64}
              unoptimized
              className="object-contain p-1.5"
            />
          ) : (
            <div
              className="size-4 rounded-full opacity-30"
              style={{ background: colorHex }}
            />
          )}
        </div>

        {/* Territory info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base leading-tight">
            {triggerName ?? territory.name}
            {required != null && (
              <span className="text-muted-foreground/50 font-normal ml-2 text-sm">
                × {required}
              </span>
            )}
          </div>
        </div>

        {/* Controlling team badge */}
        {controllingTeam ? (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md shrink-0"
            style={{
              background: `${controllingTeam.color ?? "#888"}22`,
              border: `1px solid ${controllingTeam.color ?? "#888"}55`,
            }}
          >
            <div
              className="size-5 rounded overflow-hidden shrink-0"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
            >
              {controllingTeam.image_url ? (
                <Image
                  src={controllingTeam.image_url}
                  alt={controllingTeam.name}
                  width={20}
                  height={20}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: controllingTeam.color ?? "#888" }}
                />
              )}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: controllingTeam.color ?? "#888" }}
            >
              {controllingTeam.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/40 shrink-0">
            Uncontrolled
          </span>
        )}
      </div>

      {/* Team progress rows */}
      <div className="px-4 py-2.5 pl-5 flex flex-col gap-2">
        {teams.map((team) => {
          const entry = progressMap.get(team.id);
          const qty = entry?.quantity ?? 0;
          const completions = entry?.completions ?? 0;
          const isController = territory.controlling_team_id === team.id;
          const pct =
            required != null && required > 0
              ? Math.min(1, qty / required)
              : completions > 0
                ? 1
                : 0;
          const label =
            required != null ? `${qty}/${required}` : `${completions}×`;
          const color = team.color ?? "#888";

          return (
            <div key={team.id} className="flex items-center gap-3">
              {/* Team icon */}
              <div
                className="size-9 rounded-lg overflow-hidden shrink-0"
                style={{ border: "1px solid rgba(255,255,255,0.10)" }}
              >
                {team.image_url ? (
                  <Image
                    src={team.image_url}
                    alt={team.name}
                    width={36}
                    height={36}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: color }}
                  />
                )}
              </div>

              {/* Team name */}
              <span
                className="text-sm font-medium w-36 shrink-0 truncate"
                style={{
                  color: isController ? color : "rgba(255,255,255,0.5)",
                }}
              >
                {team.name}
              </span>

              {/* Progress bar */}
              <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct * 100}%`,
                    background: color,
                    opacity: isController ? 1 : 0.6,
                  }}
                />
              </div>

              {/* Label */}
              <span
                className="text-xs font-mono tabular-nums w-12 text-right shrink-0"
                style={{
                  color: isController
                    ? color
                    : "rgba(255,255,255,0.3)",
                }}
              >
                {required != null || completions > 0 ? label : "—"}
              </span>

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
      <div className="flex flex-col gap-3">
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
