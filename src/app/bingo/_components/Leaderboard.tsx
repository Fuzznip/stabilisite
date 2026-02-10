"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
  const selectedTeam = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId)
    : undefined;

  return (
    <div className="flex h-full w-full flex-col max-w-[80vw] lg:w-96 xl:w-120">
      <h2 className="text-2xl text-foreground">Leaderboard</h2>
      <p className="text-lg text-muted-foreground mb-2">
        Click a team to see their progress
      </p>
      <Card className="relative flex w-full h-[466px] flex-col rounded-lg">
        {selectedTeam ? (
          <CardContent className="p-4! flex flex-col h-full overflow-hidden z-20">
            <div className="shrink-0 flex justify-between px-4 gap-2">
              <div className="flex items-center gap-4 mb-4">
                {selectedTeam.image_url && (
                  <div className="relative h-16 w-16 shrink-0">
                    <Image
                      src={selectedTeam.image_url}
                      alt={selectedTeam.name + " team image"}
                      fill
                      sizes="64px"
                      unoptimized
                      className="rounded-sm object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    {selectedTeam.name}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    {selectedTeam.points} points
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-fit p-2 text-base w-fit mb-2"
                onClick={() => onTeamSelect(undefined)}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto border-t pt-1">
              {selectedTeam.members.map((member) => (
                <div key={member} className="text-lg py-2 px-4">
                  {member}
                </div>
              ))}
            </div>
          </CardContent>
        ) : (
          <CardContent className="py-4 overflow-y-auto z-20">
            {teams.length ? (
              <div className="flex flex-col [&>*:not(:last-child)]:mb-4">
                {teams.map((team, index) => (
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex justify-between text-2xl gap-12 text-left items-center w-full h-fit p-4 box-border",
                    )}
                    key={team.name}
                    onClick={() => onTeamSelect(team.id)}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="font-extrabold">{index + 1}</div>
                      <div className="flex gap-4 items-center">
                        {team.image_url && (
                          <div className="relative h-16 w-16">
                            <Image
                              src={team.image_url}
                              alt={team.name + " team image"}
                              fill
                              sizes="100%"
                              unoptimized
                              className="rounded-sm object-cover"
                            />
                          </div>
                        )}
                        <div className="items-center lg:max-w-20 xl:max-w-full text-wrap">
                          {team.name}
                        </div>
                      </div>
                    </div>
                    <div>{team.points}</div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-2xl w-fit mx-auto my-24">
                No Team Data
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
