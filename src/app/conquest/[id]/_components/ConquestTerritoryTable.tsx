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
        width={32}
        height={32}
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
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded shrink-0" />
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

  const triggerName = challenge?.trigger?.name ?? trigger?.name ?? territory.name;
  const triggerImgPath = challenge?.trigger?.img_path ?? trigger?.img_path ?? null;
  const required = challenge?.quantity ?? null;
  const progressMap = new Map(progress.map((p) => [p.team_id, p]));

  return (
    <tr style={rowStyle}>
      <td className="px-4 py-2.5 sticky left-0" style={{ background: "hsl(var(--card))" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="size-8 rounded shrink-0 overflow-hidden flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {triggerImgPath ? (
              <ImageWithLoader src={triggerImgPath} alt={triggerName} />
            ) : (
              <div className="size-2 rounded-full bg-white/20" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground leading-tight">{triggerName}</div>
            {required != null && (
              <div className="text-xs text-muted-foreground/40">× {required}</div>
            )}
          </div>
        </div>
      </td>
      {teams.map((team) => {
        const entry = progressMap.get(team.id);
        const qty = entry?.quantity ?? 0;
        const completions = entry?.completions ?? 0;
        const isController = territory.controlling_team_id === team.id;
        const label = required != null ? `${qty}/${required}` : `${completions}×`;
        const color = team.color ?? "#888";

        return (
          <td key={team.id} className="py-2.5 text-center">
            <span
              className="text-sm font-mono tabular-nums"
              style={{ color: isController ? color : "rgba(255,255,255,0.35)" }}
            >
              {label}
            </span>
          </td>
        );
      })}
    </tr>
  );
}

interface ConquestTerritoryTableProps {
  territories: ConquestTerritory[];
  teams: Team[];
  regions: ConquestRegion[];
}

export function ConquestTerritoryTable({
  territories,
  teams,
  regions,
}: ConquestTerritoryTableProps) {
  const grouped = regions
    .map((region) => ({
      region,
      territories: territories
        .filter((t) => t.region_id === region.id)
        .sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999)),
    }))
    .filter((g) => g.territories.length > 0);

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
  const teamColPct = (65 / sortedTeams.length).toFixed(2) + "%";

  return (
    <div
      className="rounded-xl overflow-auto"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "35%" }} />
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
                    className="text-xs font-medium whitespace-nowrap"
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
                  <span className="text-xs uppercase font-mono font-medium text-muted-foreground/40 tracking-wider">
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
