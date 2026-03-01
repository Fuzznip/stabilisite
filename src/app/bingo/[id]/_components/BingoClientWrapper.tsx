"use client";

import { useState, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from "@tanstack/react-query";
import BingoBoard from "./BingoBoard";
import Leaderboard from "./Leaderboard";
import DropToaster from "./DropToaster";
import RecentDrops from "./RecentDrops";
import WinnerBanner from "./WinnerBanner";
import { RecentDropsProvider } from "./RecentDropsStore";
import { TeamProgressResponse, TeamWithMembers, Tile } from "@/lib/types/v2";

const queryClient = new QueryClient();

type BingoClientWrapperProps = {
  teams: TeamWithMembers[];
  tiles: Tile[];
  endDate: string;
  eventId: string;
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
  eventId,
}: BingoClientWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BingoContent
        teams={teams}
        tiles={tiles}
        endDate={endDate}
        eventId={eventId}
      />
    </QueryClientProvider>
  );
}

function BingoContent({
  teams,
  tiles,
  endDate,
  eventId,
}: {
  teams: TeamWithMembers[];
  tiles: Tile[];
  endDate: string;
  eventId: string;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(
    undefined,
  );

  const progressQueries = useQueries({
    queries: teams.map((team) => ({
      queryKey: ["team-progress", team.id],
      queryFn: () =>
        fetch(`/api/bingo/progress/${team.id}`).then((res) =>
          res.json(),
        ) as Promise<TeamProgressResponse>,
    })),
  });

  const selectedIndex = teams.findIndex((team) => team.id === selectedTeamId);
  const progress =
    selectedIndex >= 0 ? progressQueries[selectedIndex].data : undefined;
  const isLoadingProgress =
    selectedIndex >= 0 ? progressQueries[selectedIndex].isLoading : false;

  const isEventOver = new Date(endDate) <= new Date();
  const winner = isEventOver && teams.length > 0 ? teams[0] : null;

  return (
    <div className="flex flex-col items-center w-full">
      <RecentDropsProvider eventId={eventId}>
        {/* Desktop layout */}
        <div className="hidden h-0 lg:flex lg:h-full flex-col w-full z-10 items-center">
          {winner && (
            <div className="w-full max-w-2xl">
              <WinnerBanner winner={winner} />
            </div>
          )}
          <div className="flex flex-row items-start gap-8 w-full justify-center">
            <div className="flex flex-col min-w-0 flex-1 max-w-[80vw] lg:max-w-[min(calc(100vh-8rem),800px)]">
              <div className="mb-2">
                <h1 className="text-4xl font-bold">Winter Bingo 2026</h1>
                <TimeRemaining endDate={endDate} />
              </div>
              <BingoBoard
                tiles={tiles}
                progress={progress}
                isLoading={isLoadingProgress}
              />
              <RecentDrops teams={teams} />
            </div>
            <div className="flex flex-col gap-8 shrink-0">
              <Leaderboard
                teams={teams}
                selectedTeamId={selectedTeamId}
                onTeamSelect={setSelectedTeamId}
              />
            </div>
          </div>
        </div>
        {/* Mobile layout */}
        <div className="flex lg:hidden lg:h-0 w-full h-full flex-col items-center z-10">
          {winner && (
            <div className="w-full max-w-[90vw] sm:max-w-[80vw]">
              <WinnerBanner winner={winner} />
            </div>
          )}
          <div className="mb-2 w-full max-w-[90vw] sm:max-w-[80vw]">
            <h1 className="text-4xl font-bold">Winter Bingo 2026</h1>
            <TimeRemaining endDate={endDate} />
          </div>
          <BingoBoard
            tiles={tiles}
            progress={progress}
            isLoading={isLoadingProgress}
          />
          <Leaderboard
            teams={teams}
            selectedTeamId={selectedTeamId}
            onTeamSelect={setSelectedTeamId}
          />
          <RecentDrops teams={teams} />
        </div>
        <DropToaster teams={teams} eventId={eventId} />
      </RecentDropsProvider>
    </div>
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
