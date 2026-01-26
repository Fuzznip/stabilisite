"use client";

import { useState, useEffect } from "react";
import BingoBoard from "./BingoBoard";
import Leaderboard from "./Leaderboard";
import DropToaster from "./DropToaster";
import RecentDrops from "./RecentDrops";
import { ProgressProvider, useProgress } from "./ProgressStore";
import { RecentDropsProvider } from "./RecentDropsStore";
import { TeamWithMembers, Tile } from "@/lib/types/v2";

type BingoClientWrapperProps = {
  teams: TeamWithMembers[];
  tiles: Tile[];
  endDate: string;
  children?: React.ReactNode;
};

function formatTimeRemaining(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Event ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

export function BingoClientWrapper({
  teams,
  tiles,
  endDate,
  children,
}: BingoClientWrapperProps) {
  return (
    <ProgressProvider>
      <BingoContent teams={teams} tiles={tiles} endDate={endDate} />
      {children}
    </ProgressProvider>
  );
}

function BingoContent({
  teams,
  tiles,
  endDate,
}: {
  teams: TeamWithMembers[];
  tiles: Tile[];
  endDate: string;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(
    undefined,
  );
  const { progressMap, isLoading } = useProgress();

  const progress = selectedTeamId ? progressMap[selectedTeamId] : undefined;
  const isLoadingProgress = selectedTeamId ? isLoading : false;

  return (
    <>
      <div className="mb-2 z-10">
        <h1 className="text-4xl font-bold">Winter Bingo 2026</h1>
        <TimeRemaining endDate={endDate} />
      </div>
      <div className="hidden h-0 lg:flex w-full lg:h-full flex-row items-start justify-start gap-8 z-10">
        <BingoBoard tiles={tiles} progress={progress} isLoading={isLoadingProgress} />
        <div className="flex flex-col gap-8 -mt-18">
          <Leaderboard
            teams={teams}
            selectedTeamId={selectedTeamId}
            onTeamSelect={setSelectedTeamId}
          />
        </div>
      </div>
      <div className="flex lg:hidden lg:h-0 w-full h-full flex-col justify-center items-center gap-8 lg:pb-12 z-10">
        <BingoBoard tiles={tiles} progress={progress} isLoading={isLoadingProgress} />
        <Leaderboard
          teams={teams}
          selectedTeamId={selectedTeamId}
          onTeamSelect={setSelectedTeamId}
        />
      </div>
      <RecentDropsProvider>
        <RecentDrops teams={teams} />
        <DropToaster teams={teams} />
      </RecentDropsProvider>
    </>
  );
}

function TimeRemaining({ endDate }: { endDate: string }): React.ReactElement {
  const [timeRemaining, setTimeRemaining] = useState(
    formatTimeRemaining(endDate),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(endDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  return <p className="text-lg text-muted-foreground">{timeRemaining}</p>;
}
