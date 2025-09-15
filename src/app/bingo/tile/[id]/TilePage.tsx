"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, X } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Team, Tile } from "@/lib/types/bingo";
import { useBingo } from "../../_components/BingoProvider";

function getTaskTabContent(
  taskIndex: number,
  tile: Tile,
  tileIndex: number,
  teams: Team[]
): React.ReactElement {
  const teamsWithProgress = teams
    .map((team) => {
      const tileProgress = team.board_progress[tileIndex].progress[taskIndex];
      return {
        team: team,
        complete: tileProgress?.completed || false,
        target: tileProgress?.required || 0,
      };
    })
    .sort((teamA, teamB) => teamA.team.name.localeCompare(teamB.team.name));
  return (
    <Card>
      <CardTitle className="text-3xl p-8 font-normal mb-4 flex flex-col gap-2 sm:flex-row sm:gap-0">
        <span className="mr-4">Task:</span>
        <span className="">{tile.tasks[taskIndex].name}</span>
      </CardTitle>
      <CardContent className="flex flex-col">
        {teamsWithProgress.map((team) => (
          <div key={team.team.team_id} className="mb-8 flex items-center">
            <div className="flex gap-4 w-fit mr-8 sm:mr-0 sm:w-[30rem]">
              {team && (
                <div className="relative h-20 w-20">
                  <Image
                    src={`${team.team.image_url}`}
                    alt={team.team.name + " team image"}
                    fill
                    sizes="100%"
                    unoptimized
                    className="rounded-sm object-cover"
                  />
                </div>
              )}
              <div className="hidden sm:flex items-center text-2xl">
                {team.team.name}
              </div>
            </div>
            <Progress
              value={team.complete ? 100 : 0}
              className={cn(
                "w-full mr-8",
                team.complete && "[&>div]:bg-blue-500"
              )}
            />
            <div className="text-muted-foreground text-2xl text-nowrap w-[10rem] text-end">
              {team.complete ? (
                <Check className="w-16 h-16 text-blue-800 ml-auto" />
              ) : (
                <X className="w-16 h-16 text-red-800 ml-auto" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TilePage({ id }: { id: number }): React.ReactElement {
  const { teams, board } = useBingo();
  const tile = board[id];

  console.log(tile);

  return (
    <div className="flex flex-col h-full w-full px-4 sm:px-0 my-4 sm:my-0">
      <Button asChild variant="outline" className="text-foreground mb-2 w-fit">
        <Link href={"/bingo"}>
          <ArrowLeft /> Back
        </Link>
      </Button>
      {tile ? (
        <div className="flex flex-col h-full w-full">
          <div className="flex gap-8 mb-24 flex-col sm:flex-row">
            <div className="relative w-72 h-72 border-[6px] border-bingo-grid rounded-md mx-auto">
              <Image
                src={`/${id}.jpg`}
                fill
                priority
                sizes="100%"
                className="object-cover"
                alt={`${tile.name} image`}
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <h1 className="text-4xl font-bold mb-4">{tile.name}</h1>
              <Card className="w-full h-full">
                <CardContent className="flex flex-col p-8 text-foreground">
                  <div className="text-xl mb-8 flex gap-4">
                    <div className="text-muted-foreground min-w-fit">
                      Task 1:
                    </div>{" "}
                    <div>{tile.tasks[0].name}</div>
                  </div>
                  <div className="text-xl mb-8 flex gap-4">
                    <div className="text-muted-foreground min-w-fit">
                      Task 2:
                    </div>{" "}
                    <div>{tile.tasks[1].name}</div>
                  </div>
                  <div className="text-xl flex gap-4">
                    <div className="text-muted-foreground min-w-fit">
                      Task 3:
                    </div>{" "}
                    <div>{tile.tasks[2].name}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Tabs defaultValue="task1" className="w-full">
              <TabsList className="mb-4 py-6">
                <TabsTrigger value="task1" className="px-8 h-10 text-md">
                  Task 1
                </TabsTrigger>
                <TabsTrigger value="task2" className="px-8 h-10 text-md">
                  Task 2
                </TabsTrigger>
                <TabsTrigger value="task3" className="px-8 h-10 text-md">
                  Task 3
                </TabsTrigger>
              </TabsList>
              <TabsContent value="task1" className="w-full">
                {getTaskTabContent(0, tile, board.indexOf(tile), teams)}
              </TabsContent>
              <TabsContent value="task2" className="w-full">
                {getTaskTabContent(1, tile, board.indexOf(tile), teams)}
              </TabsContent>
              <TabsContent value="task3" className="w-full">
                {getTaskTabContent(2, tile, board.indexOf(tile), teams)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground text-3xl w-fit mx-auto my-24">
          No Tile Data
        </div>
      )}
    </div>
  );
}
