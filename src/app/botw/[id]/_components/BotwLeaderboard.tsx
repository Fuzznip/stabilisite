"use client";

import { useState } from "react";
import Image from "next/image";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Swords, Trophy } from "lucide-react";
import { normalizeLeaderboard } from "@/lib/fetch/getBotw";
import { cn } from "@/lib/utils";
import { BotwProofDialog } from "./BotwProofDialog";
import type {
  BotwLeaderboardBoss,
  BotwLeaderboardDrop,
  BotwLeaderboardEntry,
} from "@/lib/types/v2";

const MEDAL_CLASS: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-zinc-400",
  3: "text-amber-700",
};

const PLACE_LABEL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

/** Icon tile, matching the trigger tiles on the conquest region detail. */
const TILE =
  "relative size-16 rounded-md bg-foreground/[0.04] border border-foreground/10";
/** Clips the image to the tile's rounded corners without clipping the badge. */
const TILE_IMG = "object-contain rounded-md";

async function fetchLeaderboard(
  eventId: string,
): Promise<BotwLeaderboardEntry[]> {
  const res = await fetch(`/api/botw/${eventId}/leaderboard`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  const json = await res.json();
  return normalizeLeaderboard(json.data);
}

// Each event route owns its query client, matching the bingo and conquest
// wrappers — there is no app-wide provider to inherit from.
const queryClient = new QueryClient();

export function BotwLeaderboard(props: {
  eventId: string;
  initialData: BotwLeaderboardEntry[];
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Standings {...props} />
    </QueryClientProvider>
  );
}

/**
 * How many of that kill or drop the player has, inset on the tile's corner.
 *
 * Hidden at zero rather than rendering "0": a boss tile is drawn whenever the
 * player has *either* kills or a drop, so someone can hold a drop from a boss
 * they have no recorded kills at.
 */
function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="absolute -bottom-1.5 -right-1.5 min-w-6 rounded-full bg-stability px-1.5 text-center text-sm font-bold leading-6 text-white shadow-md">
      {count}
    </span>
  );
}

function PointsBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <span
      aria-hidden
      className="absolute inset-y-0 left-0 -z-10 bg-stability/10"
      style={{ width: `${pct}%` }}
    />
  );
}

/** A boss the player has killed, badged with the kill count. */
function BossTile({ boss }: { boss: BotwLeaderboardBoss }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(TILE, "shrink-0 border-stability/40")}
      title={`${boss.boss_name} — ${boss.kills} ${boss.kills === 1 ? "kill" : "kills"}, ${boss.points} pts`}
    >
      {boss.image_url && !failed ? (
        <Image
          src={boss.image_url}
          alt={boss.boss_name}
          fill
          sizes="64px"
          unoptimized
          className={cn(TILE_IMG, "p-1")}
          onError={() => setFailed(true)}
        />
      ) : (
        <Swords className="absolute inset-0 m-auto size-7 text-foreground/40" />
      )}
      <CountBadge count={boss.kills} />
    </div>
  );
}

/** One drop the player has banked, badged with how many they've had. */
function DropTile({
  drop,
  onOpenProofs,
}: {
  drop: BotwLeaderboardDrop;
  onOpenProofs?: () => void;
}) {
  const [failed, setFailed] = useState(false);

  // Only clickable once the backend supplies a status_id — without it there is
  // nothing to fetch proofs from, and a dead button is worse than a plain tile.
  const Tag = onOpenProofs ? "button" : "div";

  return (
    <Tag
      type={onOpenProofs ? "button" : undefined}
      onClick={onOpenProofs}
      aria-label={onOpenProofs ? `View ${drop.name} screenshots` : undefined}
      className={cn(
        TILE,
        "shrink-0 border-stability/40",
        onOpenProofs &&
          "cursor-pointer transition-colors hover:border-stability hover:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stability",
      )}
      title={`${drop.name} — ${drop.quantity}× (${drop.points} pts)`}
    >
      {drop.img_path && !failed ? (
        <Image
          src={drop.img_path}
          alt={drop.name}
          fill
          sizes="64px"
          unoptimized
          className={cn(TILE_IMG, "p-1.5")}
          onError={() => setFailed(true)}
        />
      ) : (
        <Package className="absolute inset-0 m-auto size-7 text-foreground/40" />
      )}
      <CountBadge count={drop.quantity} />
    </Tag>
  );
}

function PlayerTiles({
  entry,
  onOpenProofs,
  className,
}: {
  entry: BotwLeaderboardEntry;
  onOpenProofs: (triggerId: string) => void;
  className?: string;
}) {
  // Only bosses the player has actually engaged with; a boss they've never
  // killed but have a drop from still belongs here.
  const bosses = entry.bosses.filter(
    (boss) => boss.kills > 0 || boss.drops.length > 0,
  );
  if (bosses.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 min-w-0",
        className,
      )}
    >
      {bosses.map((boss) => (
        <div
          key={boss.boss_id}
          className="flex flex-wrap items-center gap-2 pr-3 border-r border-border/40 last:border-r-0 last:pr-0"
        >
          <BossTile boss={boss} />
          {boss.drops.map((drop) => (
            <DropTile
              key={drop.trigger_id}
              drop={drop}
              onOpenProofs={
                drop.status_id ? () => onOpenProofs(drop.trigger_id) : undefined
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function PodiumRow({
  entry,
  place,
  max,
  onOpenProofs,
}: {
  entry: BotwLeaderboardEntry;
  place: number;
  max: number;
  onOpenProofs: (triggerId: string) => void;
}) {
  const first = place === 1;

  return (
    <li
      className={cn(
        "relative isolate overflow-hidden rounded-xl border bg-card px-5 py-4",
        first ? "border-stability/60 md:py-5" : "border-border",
      )}
    >
      <PointsBar value={entry.points} max={max} />

      <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <div className="col-start-1 row-span-full flex flex-col items-center justify-center gap-1 self-center">
          <Trophy
            className={cn("size-6", MEDAL_CLASS[place] ?? "text-foreground/40")}
          />
          <span className="text-sm font-bold uppercase tracking-wide text-foreground/65">
            {PLACE_LABEL[place]}
          </span>
        </div>

        <div className="col-start-2 row-start-1 flex items-center gap-4">
          <span
            className={cn(
              "min-w-0 truncate font-bold tracking-wide text-foreground",
              first ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
            )}
          >
            {entry.rsn}
          </span>

          <span
            className={cn(
              "ml-auto shrink-0 font-extrabold tabular-nums leading-none text-stability-accent",
              first ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl",
            )}
          >
            {entry.points}
          </span>
        </div>

        <PlayerTiles
          entry={entry}
          onOpenProofs={onOpenProofs}
          className="col-start-2 row-start-2"
        />
      </div>
    </li>
  );
}

function Standings({
  eventId,
  initialData,
}: {
  eventId: string;
  initialData: BotwLeaderboardEntry[];
}) {
  const { data: standings = [] } = useQuery<BotwLeaderboardEntry[]>({
    queryKey: ["botw-leaderboard", eventId],
    queryFn: () => fetchLeaderboard(eventId),
    initialData,
    refetchInterval: 10_000,
  });

  // Which drop was clicked. One dialog serves the whole board rather than one
  // per row, so opening a second player's proofs reuses the same instance.
  const [proofTarget, setProofTarget] = useState<{
    playerId: string;
    triggerId: string;
  } | null>(null);

  const proofEntry = standings.find(
    (e) => e.player_id === proofTarget?.playerId,
  );
  // Flattened across bosses: the carousel spans everything the player has.
  const proofDrops = (proofEntry?.bosses ?? []).flatMap((boss) =>
    boss.drops.filter((drop) => drop.status_id),
  );

  if (standings.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 flex flex-col items-center gap-3 text-foreground/60">
          <Trophy className="size-10" />
          <p className="text-lg">No points scored yet. Be the first.</p>
        </CardContent>
      </Card>
    );
  }

  const max = Math.max(...standings.map((e) => e.points), 0);
  const podium = standings.length >= 3 ? standings.slice(0, 3) : [];
  const rows = podium.length > 0 ? standings.slice(3) : standings;

  const openProofs = (playerId: string) => (triggerId: string) =>
    setProofTarget({ playerId, triggerId });

  return (
    <div className="flex flex-col gap-5">
      {podium.length > 0 && (
        <ol className="flex flex-col gap-3">
          {podium.map((entry, i) => (
            <PodiumRow
              key={entry.player_id}
              entry={entry}
              place={i + 1}
              max={max}
              onOpenProofs={openProofs(entry.player_id)}
            />
          ))}
        </ol>
      )}

      {rows.length > 0 && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ul className="grid grid-cols-[auto_minmax(0,1fr)_auto] divide-y divide-border/60">
              {rows.map((entry) => (
                <li
                  key={entry.player_id}
                  className="relative isolate col-span-full grid grid-cols-subgrid items-center gap-x-4 gap-y-3 px-5 py-4"
                >
                  <PointsBar value={entry.points} max={max} />

                  <span
                    className={cn(
                      "col-start-1 row-span-full self-center w-16 text-center text-2xl font-bold tabular-nums",
                      MEDAL_CLASS[entry.rank] ?? "text-foreground/40",
                    )}
                  >
                    {entry.rank}
                  </span>

                  <span className="col-start-2 row-start-1 self-center truncate text-xl font-bold tracking-wide text-foreground">
                    {entry.rsn}
                  </span>

                  <PlayerTiles
                    entry={entry}
                    onOpenProofs={openProofs(entry.player_id)}
                    className="col-start-2 row-start-2"
                  />

                  <span className="col-start-3 row-span-full self-center text-4xl font-extrabold tabular-nums leading-none text-stability-accent">
                    {entry.points}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <BotwProofDialog
        open={proofTarget !== null}
        onOpenChange={(next) => {
          if (!next) setProofTarget(null);
        }}
        playerName={proofEntry?.rsn ?? ""}
        drops={proofDrops}
        initialTriggerId={proofTarget?.triggerId ?? null}
      />
    </div>
  );
}
