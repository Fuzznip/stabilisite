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
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
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
    case "CHALLENGE_COMPLETED":
      return {
        type: "task",
        target: log.meta.challengeName ?? "Challenge",
        isUnique: log.meta.unique === true,
      };
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

function TaskIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0 text-muted-foreground/60"
    >
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4.5 7.2 L6.3 9 L9.5 5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CaptureIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0"
      style={{ color: "rgba(230,57,70,0.9)" }}
    >
      <path
        d="M3 1 V13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M3 2 L11 2 L9 5 L11 8 L3 8 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RegionIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className="shrink-0"
      style={{ color: "#d4a44a" }}
    >
      <path
        d="M2 5 L4 10 L11 10 L13 5 L10 7 L7.5 3.5 L5 7 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12 L11.5 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
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

          const Icon =
            type === "task"
              ? TaskIcon
              : type === "capture"
                ? CaptureIcon
                : RegionIcon;

          return (
            <div
              key={log.id}
              className="relative py-4"
              style={{
                borderBottom: isLast
                  ? undefined
                  : "1px solid rgba(255,255,255,0.06)",
                ...(isRegion && {
                  margin: "4px -18px",
                  padding: "16px 18px",
                  background:
                    "linear-gradient(to right, rgba(212,164,74,0.10), rgba(212,164,74,0) 60%)",
                  borderBottom: isLast
                    ? undefined
                    : "1px solid rgba(255,255,255,0.06)",
                }),
                ...(isUniqueTask && {
                  margin: "4px -18px",
                  padding: "16px 18px",
                  background:
                    "linear-gradient(to right, rgba(95,207,114,0.08), rgba(95,207,114,0) 60%)",
                  borderBottom: isLast
                    ? undefined
                    : "1px solid rgba(255,255,255,0.06)",
                }),
              }}
            >
              {isRegion && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5"
                  style={{
                    background: "#d4a44a",
                    boxShadow: "0 0 12px rgba(212,164,74,0.6)",
                  }}
                />
              )}
              {isUniqueTask && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5"
                  style={{
                    background: "#5fcf72",
                    boxShadow: "0 0 12px rgba(95,207,114,0.6)",
                  }}
                />
              )}

              <div className="grid items-center gap-4 grid-cols-[80px_170px_1fr]">
                {/* Time */}
                <div className="text-xs uppercase font-mono text-muted-foreground/50">
                  {formatRelativeTime(log.created_at)} ago
                </div>

                {/* Team chip */}
                <div className="flex items-center gap-2 text-sm font-medium text-foreground min-w-0">
                  <div
                    className="size-8 rounded-lg overflow-hidden shrink-0 relative"
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
                  <span className="truncate">{team.name}</span>
                </div>

                {/* Action */}
                <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground min-w-0">
                  <Icon />
                  <span
                    className="text-xs uppercase font-mono"
                    style={
                      isRegion ? { color: "#d4a44a", fontWeight: 600 } : {}
                    }
                  >
                    {VERB_LABELS[type]}
                  </span>
                  <span
                    className="font-medium text-foreground"
                    style={
                      isRegion
                        ? {
                            fontSize: "14px",
                            fontWeight: 600,
                          }
                        : {}
                    }
                  >
                    {target}
                  </span>
                  {isUniqueTask && (
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        color: "#5fcf72",
                        background: "rgba(95,207,114,0.08)",
                        border: "1px solid rgba(95,207,114,0.25)",
                      }}
                    >
                      FIRST
                    </span>
                  )}
                  {regionName && type === "capture" && (
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {regionName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
