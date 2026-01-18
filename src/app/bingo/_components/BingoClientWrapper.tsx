"use client";

import { useState, useEffect } from "react";
import BingoBoard from "./BingoBoard";
import Leaderboard from "./Leaderboard";
import TeamMembers from "./TeamMembers";
import DropToaster from "./DropToaster";
import { ProgressProvider, useProgress } from "./ProgressStore";
import {
  TeamWithMembers,
  TeamProgressResponse,
  Tile,
  EventWithDetails,
} from "@/lib/types/v2";

type BingoClientWrapperProps = {
  teams: TeamWithMembers[];
  tiles: Tile[];
  progressMap?: Record<string, TeamProgressResponse>;
  initialTeamId?: string;
  endDate: string;
  children?: React.ReactNode;
};

async function fetchEventData(): Promise<EventWithDetails> {
  const response = await fetch("/api/bingo/event");
  return response.json();
}

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
  progressMap: initialProgressMap,
  initialTeamId,
  endDate,
  children,
}: BingoClientWrapperProps) {
  return (
    <ProgressProvider initialProgressMap={initialProgressMap}>
      <BingoContent
        teams={teams}
        tiles={tiles}
        initialTeamId={initialTeamId}
        endDate={endDate}
      />
      {children}
    </ProgressProvider>
  );
}

function BingoContent({
  teams: initialTeams,
  tiles: initialTiles,
  initialTeamId,
  endDate: initialEndDate,
}: {
  teams: TeamWithMembers[];
  tiles: Tile[];
  initialTeamId?: string;
  endDate: string;
}) {
  const [teams, setTeams] = useState(initialTeams);
  const [tiles, setTiles] = useState(initialTiles);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(
    initialTeamId
  );
  const [timeRemaining, setTimeRemaining] = useState(
    formatTimeRemaining(endDate)
  );
  const { progressMap, refetchAllTeamsProgress } = useProgress();

  // Refresh event data and progress on mount (handles cached client-side navigation)
  useEffect(() => {
    fetchEventData().then((event) => {
      setTeams(event.teams);
      setTiles(event.tiles);
      setEndDate(event.end_date);
      refetchAllTeamsProgress(event.teams.map((t) => t.id));
    });
  }, [refetchAllTeamsProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(endDate));
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [endDate]);

  const selectedTeam = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId)
    : undefined;

  const progress = selectedTeamId ? progressMap[selectedTeamId] : undefined;

  return (
    <>
      <div className="mb-2 z-10">
        <h1 className="text-4xl font-bold">Winter Bingo 2026</h1>
        <p className="text-lg text-muted-foreground">{timeRemaining}</p>
      </div>
      <div className="hidden lg:flex w-full h-full flex-row items-start justify-start gap-8 z-10">
        <BingoBoard tiles={tiles} progress={progress} />
        <div className="flex flex-col gap-8 -mt-18">
          <Leaderboard
            teams={teams}
            selectedTeamId={selectedTeamId}
            onTeamSelect={setSelectedTeamId}
          />
          <TeamMembers selectedTeam={selectedTeam} />
        </div>
      </div>
      <div className="flex lg:hidden w-full h-full flex-col justify-center items-center gap-8 pb-12 z-10">
        <BingoBoard tiles={tiles} progress={progress} />
        <Leaderboard
          teams={teams}
          selectedTeamId={selectedTeamId}
          onTeamSelect={setSelectedTeamId}
        />
        <TeamMembers selectedTeam={selectedTeam} />
      </div>
      <DropToaster teams={teams} />
    </>
  );
}
