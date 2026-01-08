"use client";

import { useState } from "react";
import BingoBoard from "./BingoBoard";
import Leaderboard from "./Leaderboard";
import TeamMembers from "./TeamMembers";
import DropToaster from "./DropToaster";
import { ProgressProvider, useProgress } from "./ProgressStore";
import { TeamWithMembers, TeamProgressResponse, Tile } from "@/lib/types/v2";

type BingoClientWrapperProps = {
  teams: TeamWithMembers[];
  tiles: Tile[];
  progressMap: Record<string, TeamProgressResponse>;
  initialTeamId?: string;
};

export function BingoClientWrapper({
  teams,
  tiles,
  progressMap: initialProgressMap,
  initialTeamId,
}: BingoClientWrapperProps) {
  return (
    <ProgressProvider initialProgressMap={initialProgressMap}>
      <BingoContent
        teams={teams}
        tiles={tiles}
        initialTeamId={initialTeamId}
      />
    </ProgressProvider>
  );
}

function BingoContent({
  teams,
  tiles,
  initialTeamId,
}: {
  teams: TeamWithMembers[];
  tiles: Tile[];
  initialTeamId?: string;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(
    initialTeamId
  );
  const { progressMap } = useProgress();

  const selectedTeam = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId)
    : undefined;

  const progress = selectedTeamId ? progressMap[selectedTeamId] : undefined;

  return (
    <>
      <div className="hidden lg:flex w-full h-full flex-row items-start justify-center gap-8 z-10">
        <BingoBoard tiles={tiles} progress={progress} />
        <div className="flex flex-col gap-8">
          <Leaderboard
            teams={teams}
            selectedTeamId={selectedTeamId}
            onTeamSelect={setSelectedTeamId}
          />
          <TeamMembers selectedTeam={selectedTeam} />
        </div>
      </div>
      <div className="flex lg:hidden w-full h-full flex-col justify-center items-center gap-8 pb-12 px-2">
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
