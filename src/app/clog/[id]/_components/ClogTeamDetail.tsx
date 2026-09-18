"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import type { LeaderboardTeam } from "@/components/event-leaderboard/EventLeaderboard";
import type { ClogSlot, ClogTeamPlayers } from "@/lib/types/v2";
import { cn, collectionLogItemImage } from "@/lib/utils";

async function fetchPlayers(eventId: string): Promise<ClogTeamPlayers[]> {
  const res = await fetch(`/api/clog/${eventId}/players`);
  if (!res.ok) return [];
  return (await res.json()) as ClogTeamPlayers[];
}

/**
 * A team up close: how far along the race they are, and who on the roster
 * actually landed what.
 *
 * The progress half is derived from data the page already holds. The roster
 * half needs per-player attribution, which only the server can join, so it is
 * fetched on demand — the dialog is only ever open for one team at a time.
 */
export function ClogTeamDetail({
  eventId,
  team,
  slots,
  completedItemIds,
  highValuePoints = 3,
}: {
  eventId: string;
  team: LeaderboardTeam;
  slots: ClogSlot[];
  completedItemIds: Set<number>;
  highValuePoints?: number;
}): React.ReactElement {
  const { tabs, totalDone, totalSlots } = useMemo(() => {
    const byTab = new Map<string, { done: number; total: number }>();
    let done = 0;
    for (const slot of slots) {
      const got = completedItemIds.has(slot.item_id);
      const tab = byTab.get(slot.category) ?? { done: 0, total: 0 };
      tab.total += 1;
      if (got) {
        tab.done += 1;
        done += 1;
      }
      byTab.set(slot.category, tab);
    }
    return {
      tabs: [...byTab.entries()].sort((a, b) => b[1].total - a[1].total),
      totalDone: done,
      totalSlots: slots.length,
    };
  }, [slots, completedItemIds]);

  const { data: allTeams, isPending } = useQuery({
    queryKey: ["clog-players", eventId],
    queryFn: () => fetchPlayers(eventId),
    staleTime: 10_000,
  });

  const roster = allTeams?.find((t) => t.team_id === team.id)?.players ?? [];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Slots completed
          </h4>
          <span className="text-sm tabular-nums text-muted-foreground">
            {totalDone} / {totalSlots}
          </span>
        </div>
        <Meter
          value={totalDone}
          max={totalSlots}
          color={team.color ?? undefined}
        />
        {tabs.map(([tab, { done, total }]) => (
          <div key={tab} className="mt-1 flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{tab}</span>
              <span className="tabular-nums text-muted-foreground">
                {done} / {total}
              </span>
            </div>
            <Meter value={done} max={total} color={team.color ?? undefined} />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Roster
          </h4>
          {roster.length > 0 && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {roster.length} member{roster.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading roster…</p>
        ) : roster.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No players on this team yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60">
            {roster.map((player) => (
              <li
                key={player.player_id}
                className="flex flex-col gap-1.5 py-2 first:pt-0"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      player.drops.length
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {player.player_name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-sm tabular-nums",
                      player.points
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {player.points} pts
                  </span>
                </div>

                {player.drops.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {player.drops.map((drop) => (
                      <span
                        key={`${player.player_id}-${drop.item_id}`}
                        title={`${drop.item_name} — ${drop.page} — ${drop.points} pt${drop.points === 1 ? "" : "s"}`}
                        className={cn(
                          "relative inline-flex size-8 items-center justify-center rounded border",
                          drop.points >= highValuePoints
                            ? "border-yellow-500/50 bg-yellow-500/10"
                            : "border-border bg-muted/40",
                        )}
                      >
                        <Image
                          src={collectionLogItemImage(drop.item_id)}
                          alt={drop.item_name}
                          width={28}
                          height={24}
                          unoptimized
                          className="object-contain"
                        />
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Meter({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color?: string;
}): React.ReactElement {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-foreground/10"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.max(pct, value > 0 ? 2 : 0)}%`,
          background: color ?? "var(--foreground)",
        }}
      />
    </div>
  );
}
