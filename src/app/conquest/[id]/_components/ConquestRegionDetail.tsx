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

      {/* Territory name */}
      <div className="px-3 pt-2.5 pl-4 text-xs text-muted-foreground/50 font-medium uppercase tracking-wider truncate">
        {territory.name}
      </div>

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 pl-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Trigger image */}
        <div
          className="size-16 rounded-md shrink-0 overflow-hidden flex items-center justify-center"
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
              className="size-3 rounded-full opacity-30"
              style={{ background: colorHex }}
            />
          )}
        </div>

        {/* Territory info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base leading-tight truncate">
            {triggerName ?? territory.name}
            {required != null && (
              <span className="text-muted-foreground/50 font-normal ml-1.5 text-xs">
                × {required}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Team progress */}
      <div className="pl-4 flex flex-wrap">
        {teams.map((team, i) => {
          const entry = progressMap.get(team.id);
          const qty = entry?.quantity ?? 0;
          const completions = entry?.completions ?? 0;
          const isController = territory.controlling_team_id === team.id;
          const label =
            required != null ? `${qty}/${required}` : `${completions}×`;
          const hasProgress = required != null ? qty > 0 : completions > 0;
          const color = team.color ?? "#888";

          const inner = (
            <div className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg transition-colors${hasProgress ? " cursor-pointer hover:bg-white/[0.06]" : ""}`}>
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
                  style={{ color: isController ? color : "rgba(255,255,255,0.3)" }}
                >
                  {label}
                </span>
              </div>
            </div>
          );

          return (
            <div key={team.id} className="flex items-center">
              {hasProgress ? (
                <TerritoryProofDialog
                  territoryId={territory.id}
                  teamId={team.id}
                  triggerName={triggerName}
                >
                  {inner}
                </TerritoryProofDialog>
              ) : inner}
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
