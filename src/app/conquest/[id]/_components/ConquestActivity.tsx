"use client";

import Image from "next/image";
import type {
  ConquestRegion,
  ConquestTerritory,
  EventLog,
  Team,
} from "@/lib/types/v2";

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

interface ConquestActivityProps {
  logs: EventLog[];
  teams: Team[];
  territories: ConquestTerritory[];
  regions: ConquestRegion[];
}

const VERB_LABELS: Record<ActivityType, string> = {
  task: "Completed",
  capture: "Captured",
  region: "Secured region",
};

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

export function ConquestActivity({
  logs,
  teams,
  territories,
  regions,
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

  return (
    <section>
      <SectionHeader />

      <div
        className="flex flex-col rounded-xl px-4.5"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {logs.map((log, i) => {
          const team = teams.find((t) => t.id === log.team_id);
          if (!team) return null;

          const { type, target, regionName, isUnique } = getActivityInfo(
            log,
            territories,
            regions,
          );
          const isRegion = type === "region";
          const isUniqueTask = type === "task" && isUnique;
          const isLast = i === logs.length - 1;

          const isSpecial = isRegion || isUniqueTask;

          return (
            <div
              key={log.id}
              className="relative flex items-center gap-4 py-3.5"
              style={{
                borderBottom: isLast
                  ? undefined
                  : "1px solid rgba(255,255,255,0.06)",
                ...(isSpecial &&
                  team && {
                    margin: "0 -18px",
                    padding: "14px 18px",
                    background: `linear-gradient(to right, ${team.color ?? "#888"}18, transparent 60%)`,
                    borderBottom: isLast
                      ? undefined
                      : "1px solid rgba(255,255,255,0.06)",
                  }),
              }}
            >
              {isSpecial && team && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5"
                  style={{
                    background: team.color ?? "#888",
                    boxShadow: `0 0 10px ${team.color ?? "#888"}88`,
                  }}
                />
              )}

              {/* Time */}
              <div className="text-sm font-mono text-muted-foreground/50 w-17 shrink-0">
                {formatRelativeTime(log.created_at)}
              </div>

              {/* Team */}
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

              {/* Action */}
              <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
                {log.meta?.playerName && (
                  <span
                    className="text-base font-mono shrink-0"
                    style={{ color: team?.color ?? "#888" }}
                  >
                    {log.meta.playerName}
                  </span>
                )}
                <span className="text-base uppercase font-mono text-muted-foreground/50 shrink-0">
                  {VERB_LABELS[type]}
                </span>
                <span
                  className="text-base font-medium"
                  style={{
                    color:
                      isRegion && team
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
                      color: team?.color ?? "#888",
                      background: `${team?.color ?? "#888"}18`,
                      border: `1px solid ${team?.color ?? "#888"}44`,
                    }}
                  >
                    FIRST
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
