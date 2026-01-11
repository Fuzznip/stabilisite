"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TeamWithMembers } from "@/lib/types/v2";

type LeaderboardProps = {
  teams: TeamWithMembers[];
  selectedTeamId?: string;
  onTeamSelect: (teamId: string | undefined) => void;
};

export default function Leaderboard({
  teams,
  selectedTeamId,
  onTeamSelect,
}: LeaderboardProps) {
  const handleTeamClick = (team: TeamWithMembers) => {
    if (selectedTeamId === team.id) {
      onTeamSelect(undefined);
    } else {
      onTeamSelect(team.id);
    }
  };

  return (
    <div className="flex h-full w-full flex-col sm:min-w-[30rem]">
      <span className="text-3xl text-foreground">Leaderboard</span>
      <span className="text-xl text-muted-foreground mb-2">
        Click a team to see their progress
      </span>
      <Card className="flex w-full h-full flex-col gap-4 rounded-lg">
        <CardContent className="py-4 [&>*:not(:last-child)]:mb-4">
          {teams.length ? (
            teams.map((team, index) => (
              <Button
                variant="ghost"
                className={cn(
                  "flex justify-between text-3xl gap-12 text-left items-center w-full h-fit p-4 box-border",
                  selectedTeamId === team.id &&
                    "bg-accent outline outline-foreground"
                )}
                key={team.name}
                onClick={() => handleTeamClick(team)}
              >
                <div className="flex gap-4 items-center">
                  <div>{index + 1}</div>
                  <div className="flex gap-4 items-center">
                    {true && (
                      <div className="relative h-20 w-20">
                        <Image
                          src={`${team.image_url}`}
                          alt={team.name + " team image"}
                          fill
                          sizes="100%"
                          unoptimized
                          className="rounded-sm object-cover"
                        />
                      </div>
                    )}
                    <div className="items-center hidden sm:flex">
                      {team.name}
                    </div>
                  </div>
                </div>
                <div>{team.points}</div>
              </Button>
            ))
          ) : (
            <div className="text-muted-foreground text-2xl w-fit mx-auto my-24">
              No Team Data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
