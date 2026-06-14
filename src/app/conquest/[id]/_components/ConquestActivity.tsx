"use client";

import Image from "next/image";
import { CornerDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ConquestRegion,
  ConquestTerritory,
  EventLog,
  Team,
} from "@/lib/types/v2";
import { TerritoryProofDialog } from "./TerritoryProofDialog";

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type ActivityType = "task" | "capture" | "region";

const LOG_PRIORITY: Record<string, number> = {
  REGION_CONTROL: 3,
  TERRITORY_CONTROL: 2,
  CHALLENGE_COMPLETED: 1,
};

// Sanity-check window — causal links are the primary grouping criterion
const CAUSAL_WINDOW_MS = 30_000;

type LogGroup = { primary: EventLog; secondary: EventLog[] };

function groupLogs(logs: EventLog[], territories: ConquestTerritory[]): LogGroup[] {
  const used = new Set<string>();
  const groups: LogGroup[] = [];

  function withinWindow(a: EventLog, b: EventLog) {
    return (
      Math.abs(
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ) <= CAUSAL_WINDOW_MS
    );
  }

  // Pass 1: REGION_CONTROL events claim their related TERRITORY_CONTROL + CHALLENGE_COMPLETED
  for (const log of logs) {
    if (log.type !== "REGION_CONTROL" || !log.entity_id || used.has(log.id))
      continue;
    used.add(log.id);

    const regionTerrs = territories.filter((t) => t.region_id === log.entity_id);
    const territoryIds = new Set(regionTerrs.map((t) => t.id));
    const challengeIds = new Set(
      regionTerrs.map((t) => t.challenge_id).filter(Boolean) as string[],
    );

    const related: EventLog[] = [];
    for (const other of logs) {
      if (used.has(other.id) || other.team_id !== log.team_id) continue;
      if (!withinWindow(log, other)) continue;
      if (
        (other.type === "TERRITORY_CONTROL" &&
          other.entity_id &&
          territoryIds.has(other.entity_id)) ||
        (other.type === "CHALLENGE_COMPLETED" &&
          other.entity_id &&
          challengeIds.has(other.entity_id))
      ) {
        related.push(other);
        used.add(other.id);
      }
    }

    related.sort((a, b) => (LOG_PRIORITY[b.type] ?? 0) - (LOG_PRIORITY[a.type] ?? 0));
    groups.push({ primary: log, secondary: related });
  }

  // Pass 2: TERRITORY_CONTROL events claim their related CHALLENGE_COMPLETED
  for (const log of logs) {
    if (log.type !== "TERRITORY_CONTROL" || !log.entity_id || used.has(log.id))
      continue;
    used.add(log.id);

    const territory = territories.find((t) => t.id === log.entity_id);
    const related: EventLog[] = [];

    if (territory?.challenge_id) {
      for (const other of logs) {
        if (used.has(other.id) || other.team_id !== log.team_id) continue;
        if (!withinWindow(log, other)) continue;
        if (
          other.type === "CHALLENGE_COMPLETED" &&
          other.entity_id === territory.challenge_id
        ) {
          related.push(other);
          used.add(other.id);
        }
      }
    }

    groups.push({ primary: log, secondary: related });
  }

  // Pass 3: remaining logs are solo
  for (const log of logs) {
    if (!used.has(log.id)) {
      groups.push({ primary: log, secondary: [] });
      used.add(log.id);
    }
  }

  // Restore display order (newest first by primary event)
  groups.sort(
    (a, b) =>
      new Date(b.primary.created_at).getTime() -
      new Date(a.primary.created_at).getTime(),
  );

  return groups;
}

function getActivityInfo(
  log: EventLog,
  territories: ConquestTerritory[],
  regions: ConquestRegion[],
): {
  type: ActivityType;
  target: string;
  regionName?: string;
  isUnique?: boolean;
} {
  switch (log.type) {
    case "CHALLENGE_COMPLETED": {
      const territory = territories.find(
        (t) => t.challenge_id === log.entity_id,
      );
      const region = territory
        ? regions.find((r) => r.id === territory.region_id)
        : null;
      return {
        type: "task",
        target: log.meta.challengeName ?? "Challenge",
        isUnique: log.meta.unique === true,
        regionName: region?.name,
      };
    }
    case "TERRITORY_CONTROL": {
      const territory = territories.find((t) => t.id === log.entity_id);
      const region = territory
        ? regions.find((r) => r.id === territory.region_id)
        : null;
      return {
        type: "capture",
        target: territory?.name ?? "Territory",
        regionName: region?.name,
      };
    }
    case "REGION_CONTROL": {
      const region = regions.find((r) => r.id === log.entity_id);
      return { type: "region", target: region?.name ?? "Region" };
    }
    default:
      return { type: "task", target: "Activity" };
  }
}

function getProofTerritoryId(
  log: EventLog,
  territories: ConquestTerritory[],
): string | null {
  if (log.type === "CHALLENGE_COMPLETED" && log.entity_id)
    return territories.find((t) => t.challenge_id === log.entity_id)?.id ?? null;
  return null;
}

const VERB_LABELS: Record<ActivityType, string> = {
  task: "Completed",
  capture: "Captured",
  region: "Secured region",
};

interface ConquestActivityProps {
  logs: EventLog[];
  teams: Team[];
  territories: ConquestTerritory[];
  regions: ConquestRegion[];
  loadingMore?: boolean;
}

function SectionHeader() {
  return (
    <div
      className="flex items-center justify-between pb-3.5 mb-4"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <h3 className="font-semibold uppercase">Recent Activity</h3>
    </div>
  );
}

interface RowProps {
  log: EventLog;
  team: Team;
  territories: ConquestTerritory[];
  regions: ConquestRegion[];
  isLast: boolean;
  compact?: boolean;
}

function ActivityRow({
  log,
  team,
  territories,
  regions,
  isLast,
  compact = false,
}: RowProps) {
  const { type, target, regionName, isUnique } = getActivityInfo(
    log,
    territories,
    regions,
  );
  const isRegion = type === "region";
  const isUniqueTask = type === "task" && isUnique;
  const isSpecial = !compact && (isRegion || type === "capture");

  const proofTerritoryId = getProofTerritoryId(log, territories);

  const inner = (
    <div
      className={[
        "relative flex items-center gap-4",
        compact ? "py-2 pl-36" : "py-3.5",
        proofTerritoryId
          ? "cursor-pointer hover:brightness-125 transition-[filter]"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderBottom: isLast ? undefined : "1px solid rgba(255,255,255,0.06)",
        ...(isSpecial && {
          margin: "0 -18px",
          padding: "14px 18px",
          background: `linear-gradient(to right, ${team.color ?? "#888"}18, transparent 60%)`,
          borderBottom: isLast
            ? undefined
            : "1px solid rgba(255,255,255,0.06)",
        }),
      }}
    >
      {isSpecial && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{
            background: team.color ?? "#888",
            boxShadow: `0 0 10px ${team.color ?? "#888"}88`,
          }}
        />
      )}

      {/* Time */}
      {!compact && (
        <div className="text-sm font-mono text-muted-foreground/50 w-17 shrink-0">
          {formatRelativeTime(log.created_at)}
        </div>
      )}

      {/* Team icon — only on primary rows */}
      {!compact && (
        <div
          className="size-11 rounded-lg overflow-hidden shrink-0 relative"
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
            <div
              className="w-full h-full"
              style={{ background: team.color ?? "#888" }}
            />
          )}
        </div>
      )}

      {/* Action */}
      {compact && (
        <CornerDownRight
          className="absolute size-5 text-muted-foreground/40"
          strokeWidth={2}
          style={{ left: "108px" }}
        />
      )}
      <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap flex-1">
        {log.meta?.playerName && (
          <span
            className="text-base font-mono shrink-0"
            style={{ color: team.color ?? "#888" }}
          >
            {log.meta.playerName}
          </span>
        )}
        <span
          className="text-base uppercase font-mono text-muted-foreground/50 shrink-0"
        >
          {VERB_LABELS[type]}
        </span>
        <span
          className="text-base font-medium"
          style={{
            color:
              isRegion && !compact
                ? (team.color ?? "#888")
                : "rgba(255,255,255,0.85)",
          }}
        >
          {target}
        </span>
        {regionName && (
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0"
            style={{
              color: "rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {regionName}
          </span>
        )}
        {isUniqueTask && (
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0"
            style={{
              color: team.color ?? "#888",
              background: `${team.color ?? "#888"}18`,
              border: `1px solid ${team.color ?? "#888"}44`,
            }}
          >
            FIRST
          </span>
        )}
      </div>

</div>
  );

  if (proofTerritoryId) {
    return (
      <TerritoryProofDialog
        territoryId={proofTerritoryId}
        teamId={log.team_id}
        triggerName={log.meta.challengeName ?? target}
        createdAt={log.created_at}
      >
        {inner}
      </TerritoryProofDialog>
    );
  }

  return inner;
}

function ActivityGroup({
  group,
  teams,
  territories,
  regions,
  isLast,
}: {
  group: LogGroup;
  teams: Team[];
  territories: ConquestTerritory[];
  regions: ConquestRegion[];
  isLast: boolean;
}) {
  const { primary, secondary } = group;
  const team = teams.find((t) => t.id === primary.team_id);
  if (!team) return null;

  return (
    <>
      <ActivityRow
        log={primary}
        team={team}
        territories={territories}
        regions={regions}
        isLast={isLast && secondary.length === 0}
      />
      {secondary.map((log, i) => {
        const secTeam = teams.find((t) => t.id === log.team_id) ?? team;
        return (
          <ActivityRow
            key={log.id}
            log={log}
            team={secTeam}
            territories={territories}
            regions={regions}
            isLast={isLast && i === secondary.length - 1}
            compact
          />
        );
      })}
    </>
  );
}

export function ConquestActivity({
  logs,
  teams,
  territories,
  regions,
  loadingMore = false,
}: ConquestActivityProps) {
  if (logs.length === 0) {
    return (
      <section>
        <SectionHeader />
        <div
          className="rounded-xl py-12 text-center text-sm text-muted-foreground/60"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          No activity yet
        </div>
      </section>
    );
  }

  const groups = groupLogs(logs, territories);

  return (
    <section>
      <SectionHeader />
      <div
        className="flex flex-col rounded-xl px-4.5 overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {groups.map((group, i) => (
          <ActivityGroup
            key={group.primary.id}
            group={group}
            teams={teams}
            territories={territories}
            regions={regions}
            isLast={i === groups.length - 1 && !loadingMore}
          />
        ))}
        {loadingMore &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="flex items-center gap-4 py-3.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Skeleton className="w-14 h-4 rounded shrink-0" />
              <Skeleton className="size-11 rounded-lg shrink-0" />
              <div className="flex gap-2 flex-1">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
