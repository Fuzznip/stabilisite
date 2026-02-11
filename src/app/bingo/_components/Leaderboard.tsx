"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Award, Users } from "lucide-react";
import { TeamWithMembers } from "@/lib/types/v2";

type LeaderboardProps = {
  teams: TeamWithMembers[];
  selectedTeamId?: string;
  onTeamSelect: (teamId: string | undefined) => void;
};

// Medal styling for top 3 teams
const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return {
      icon: Trophy,
      className:
        "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
      label: "1st",
    };
  }
  if (rank === 2) {
    return {
      icon: Award,
      className:
        "bg-slate-400/20 text-slate-600 dark:text-slate-300 border-slate-400/30",
      label: "2nd",
    };
  }
  if (rank === 3) {
    return {
      icon: Award,
      className:
        "bg-amber-600/20 text-amber-700 dark:text-amber-500 border-amber-600/30",
      label: "3rd",
    };
  }
  return null;
};

export default function Leaderboard({
  teams,
  selectedTeamId,
  onTeamSelect,
}: LeaderboardProps) {
  const selectedTeam = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId)
    : undefined;

  const selectedTeamRank = selectedTeam
    ? teams.findIndex((t) => t.id === selectedTeamId) + 1
    : 0;

  return (
    <div className="flex h-full w-full flex-col max-w-[90vw] sm:max-w-[80vw] lg:w-96 xl:w-120 mt-8 lg:mt-2">
      <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
      <p className="text-lg text-muted-foreground mb-2">
        {selectedTeam ? "Team Details" : "Click a team to see members"}
      </p>

      <Card className="relative flex w-full flex-col rounded-lg overflow-hidden">
        {selectedTeam ? (
          // SELECTED TEAM VIEW
          <CardContent className="p-0 flex flex-col min-h-[466px] max-h-[80vh]">
            {/* Header with back button */}
            <div className="shrink-0 border-b p-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => onTeamSelect(undefined)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to leaderboard
              </Button>

              {/* Team info header */}
              <div className="flex items-start gap-4">
                {selectedTeam.image_url && (
                  <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden border-2 border-border">
                    <Image
                      src={selectedTeam.image_url}
                      alt={selectedTeam.name}
                      fill
                      sizes="80px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold truncate">
                      {selectedTeam.name}
                    </h3>
                    {getRankBadge(selectedTeamRank) && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 font-semibold",
                          getRankBadge(selectedTeamRank)?.className,
                        )}
                      >
                        {(() => {
                          const badge = getRankBadge(selectedTeamRank);
                          const Icon = badge?.icon;
                          return Icon && <Icon className="h-3 w-3" />;
                        })()}
                        {getRankBadge(selectedTeamRank)?.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums">
                      {selectedTeam.points}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      points
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Members section */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Team Members ({selectedTeam.members.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedTeam.members.map((member) => (
                  <div
                    key={member}
                    className="px-3 py-2 rounded-md bg-muted/40 border border-border/50 text-sm font-medium truncate hover:bg-muted/60 transition-colors"
                  >
                    {member}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        ) : (
          // TEAM LIST VIEW
          <CardContent className="p-0">
            {teams.length ? (
              <div className="divide-y divide-border max-h-[80vh] overflow-y-auto">
                {teams.map((team, index) => {
                  const rank = index + 1;
                  const rankBadge = getRankBadge(rank);

                  return (
                    <button
                      key={team.id}
                      onClick={() => onTeamSelect(team.id)}
                      className={cn(
                        "w-full flex items-center gap-2 p-4 text-left transition-all hover:bg-muted/50 active:bg-muted group",
                      )}
                    >
                      {/* Rank indicator */}
                      <div className="flex items-center justify-center shrink-0 w-8">
                        {rankBadge ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "size-8 p-0 justify-center font-bold border-2 text-lg",
                              rankBadge.className,
                            )}
                          >
                            {rank}
                          </Badge>
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground tabular-nums">
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Team image */}
                      {team.image_url && (
                        <div className="relative h-16 w-16 shrink-0 rounded overflow-hidden border border-border group-hover:border-foreground/20 transition-colors">
                          <Image
                            src={team.image_url}
                            alt={team.name}
                            fill
                            sizes="64px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Team name */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-2xl lg:truncate group-hover:text-foreground transition-colors">
                          {team.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {team.members.length}{" "}
                          {team.members.length === 1 ? "member" : "members"}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold tabular-nums">
                          {team.points}
                        </div>
                        <div className="text-sm text-muted-foreground">pts</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-4">
                <Trophy className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg text-muted-foreground">No teams yet</p>
                <p className="text-sm text-muted-foreground/60">
                  Teams will appear here when created
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
