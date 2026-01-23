"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useRecentDrops } from "./RecentDropsStore";
import { useRelativeTime } from "../_hooks/useRelativeTime";
import { Drop } from "@/lib/types/drop";
import { TeamWithMembers } from "@/lib/types/v2";
import Image from "next/image";

type RecentDropsProps = {
  teams: TeamWithMembers[];
};

function findTeamForPlayer(
  player: string,
  teams: TeamWithMembers[],
): TeamWithMembers | undefined {
  return teams.find((t) =>
    t.members.map((m) => m.toLowerCase()).includes(player.toLowerCase()),
  );
}

export default function RecentDrops({ teams }: RecentDropsProps) {
  const [expanded, setExpanded] = useState(false);
  const { drops, loading, hasMore, loadMore, initialized } = useRecentDrops();

  const handleToggle = () => {
    if (!expanded && !initialized) {
      loadMore();
    }
    setExpanded(!expanded);
  };

  const filteredDrops = useMemo(
    () => drops.filter((drop) => findTeamForPlayer(drop.player, teams)),
    [drops, teams],
  );

  const showSkeletons = !initialized && loading;
  const showEmpty = initialized && !loading && filteredDrops.length === 0;

  return (
    <div className="flex w-full flex-col items-start lg:mt-8 max-w-[80vh]">
      <div className="flex w-full items-center justify-start gap-12 mb-2">
        <div>
          <h2 className="text-2xl text-foreground">Recent Drops</h2>
          <p className="text-lg text-muted-foreground">
            All drops from the event
          </p>
        </div>
        <Button variant="outline" onClick={handleToggle}>
          {expanded ? "Hide" : "Show"}
        </Button>
      </div>
      {expanded && (
        <Card className="w-full p-6">
          <div className="flex flex-col divide-y divide-border">
            {showSkeletons ? (
              <>
                <DropItemSkeleton />
                <DropItemSkeleton />
                <DropItemSkeleton />
                <DropItemSkeleton />
                <DropItemSkeleton />
              </>
            ) : showEmpty ? (
              <div className="text-muted-foreground text-xl w-fit mx-auto my-12">
                No drops yet!
              </div>
            ) : (
              <>
                {filteredDrops.map((drop) => (
                  <DropItem key={drop.id} drop={drop} teams={teams} />
                ))}
                {hasMore && (
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                    className="w-fit px-4 py-2 mt-4 mx-auto"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function DropItemSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-sm" />
      <div className="flex flex-col flex-1 gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-7 w-40" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

function DropItem({ drop, teams }: { drop: Drop; teams: TeamWithMembers[] }) {
  const team = findTeamForPlayer(drop.player, teams)!;

  const formattedItemName = drop.itemName
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const suffix =
    drop.submitType === "KC" ? " KC" : drop.submitType === "SKILL" ? " XP" : "";

  const prefix = drop.submitType === "SKILL" ? `${drop.quantity} ` : "";

  return (
    <div className="flex items-center gap-4 py-4">
      {team.image_url && (
        <div className="relative h-12 w-12 shrink-0">
          <Image
            src={team.image_url}
            alt={`${team.name} team image`}
            fill
            sizes="48px"
            unoptimized
            className="rounded-sm object-cover"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg text-muted-foreground capitalize truncate">
            {drop.player}
          </span>
        </div>
        <span className="text-2xl text-foreground">
          {prefix}
          {formattedItemName}
          {suffix}
        </span>
      </div>
      <DropTime date={drop.date} />
    </div>
  );
}

function DropTime({ date }: { date: Date }) {
  const relativeTime = useRelativeTime(date);
  return (
    <span className="text-base text-muted-foreground whitespace-nowrap">
      {relativeTime}
    </span>
  );
}
