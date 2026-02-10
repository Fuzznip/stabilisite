"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ProofImageDialog } from "@/components/ProofImageDialog";
import { useRecentDrops, DropTypeFilter } from "./RecentDropsStore";
import { useRelativeTime } from "../_hooks/useRelativeTime";
import { Drop } from "@/lib/types/drop";
import { TeamWithMembers } from "@/lib/types/v2";
import Image from "next/image";

const DROP_TYPE_LABELS: Record<DropTypeFilter, string> = {
  DROP: "Drop",
  KC: "KC",
  SKILL: "Skill",
};

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
  const {
    drops,
    loading,
    hasMore,
    loadMore,
    initialized,
    activeFilters,
    setFilters,
  } = useRecentDrops();

  const handleToggle = () => {
    if (!expanded && !initialized) {
      loadMore();
    }
    setExpanded(!expanded);
  };

  const toggleFilter = (filter: DropTypeFilter) => {
    const next = new Set(activeFilters);
    if (next.has(filter)) {
      next.delete(filter);
    } else {
      next.add(filter);
    }
    setFilters(next);
    // Trigger reload after filter change
    if (expanded) {
      loadMore();
    }
  };

  const filteredDrops = useMemo(
    () =>
      drops.filter(
        (drop) => drop.teamId || findTeamForPlayer(drop.player, teams),
      ),
    [drops, teams],
  );

  const showSkeletons = !initialized && loading;
  const showEmpty = initialized && !loading && filteredDrops.length === 0;

  return (
    <div className="flex w-full flex-col items-start mt-12 min-w-0 max-w-[80vw]">
      <div className="flex w-full items-end justify-between mb-2">
        <div>
          <h2 className="text-2xl text-foreground">Recent Drops</h2>
          <p className="text-lg text-muted-foreground">
            All drops from the event
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Filter
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="flex flex-col gap-1">
            {(["DROP", "KC", "SKILL"] as DropTypeFilter[]).map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={activeFilters.has(type)}
                onCheckedChange={() => toggleFilter(type)}
                onSelect={(e) => e.preventDefault()}
                className={activeFilters.has(type) ? "bg-muted" : ""}
              >
                {DROP_TYPE_LABELS[type]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card className="w-full p-4 pt-2 flex overflow-hidden">
        {!expanded ? (
          <Button
            variant="outline"
            onClick={handleToggle}
            className="w-fit px-6 py-2 mx-auto"
          >
            Show Drops
          </Button>
        ) : (
          <div className="flex flex-col divide-y divide-border w-full">
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
        )}
      </Card>
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
  // Look up team by ID if available (new format), otherwise fall back to player name lookup
  const team = drop.teamId
    ? teams.find((t) => t.id === drop.teamId)
    : findTeamForPlayer(drop.player, teams);

  // Show playerRsn in parentheses if different from submitted RSN
  const showAltName =
    drop.playerRsn &&
    drop.playerRsn.toLowerCase() !== drop.player.toLowerCase();

  const formattedItemName = drop.itemName
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const suffix =
    drop.submitType === "KC"
      ? " KC"
      : drop.submitType === "SKILL"
        ? " XP"
        : drop.submitType === "CHAT" && Number(drop.quantity) > 1
          ? "s"
          : "";

  const prefix =
    drop.submitType === "SKILL" || drop.submitType === "CHAT"
      ? `${drop.quantity} `
      : "";

  return (
    <div className="flex items-center gap-2 sm:gap-4 py-4">
      {team?.image_url && (
        <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0">
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
          <span className="text-sm sm:text-lg text-muted-foreground capitalize truncate">
            {drop.player}
            {showAltName && (
              <span className="text-muted-foreground/70">
                {" "}
                ({drop.playerRsn})
              </span>
            )}
          </span>
        </div>
        <span className="text-lg sm:text-2xl text-foreground truncate">
          {prefix}
          {formattedItemName}
          {suffix}
        </span>
      </div>
      <DropTime date={drop.date} />
      {drop.imgPath && (
        <ProofImageDialog
          images={[{ src: drop.imgPath, timestamp: drop.date }]}
          title={formattedItemName}
          subtitle={drop.player}
          date={drop.date}
        />
      )}
    </div>
  );
}

function DropTime({ date }: { date: Date }) {
  const relativeTime = useRelativeTime(date);
  return (
    <span className="text-xs sm:text-base text-muted-foreground whitespace-nowrap shrink-0">
      {relativeTime}
    </span>
  );
}
