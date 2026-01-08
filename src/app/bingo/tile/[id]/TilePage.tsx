"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, X } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Task, TeamProgress, TileWithTasks } from "@/lib/types/v2";

type TilePageProps = {
  tile: TileWithTasks;
  teamProgresses: TeamProgress[];
};

function getTaskTabContent(
  task: Task,
  teamProgresses: TeamProgress[]
): React.ReactElement {
  const teamsWithProgress = teamProgresses
    ?.map((teamProgress) => {
      const taskStatus = teamProgress.task_statuses.find(
        (t) => t.task_id === task.id
      );

      // Get all challenges for this task
      const allChallenges = teamProgress.challenge_statuses.filter(
        (challenge) => challenge.task_id === task.id
      );

      // Map all challenges to progress format
      const progress = allChallenges.map((challenge) => ({
        name: challenge.trigger.name,
        quantity: challenge.quantity,
        required: challenge.required,
        completed: challenge.completed,
        requireAll: challenge.require_all,
        children: undefined,
      }));

      console.log(progress);

      return {
        team: teamProgress,
        complete: taskStatus?.completed,
        progress,
      };
    })
    .sort((teamA, teamB) => teamA.team.name.localeCompare(teamB.team.name));

  return (
    <Card>
      <CardTitle className="text-3xl p-8 font-normal mb-4 flex flex-col gap-2 sm:flex-row sm:gap-0">
        <span className="mr-4">Task:</span>
        <span className="">{task.name}</span>
      </CardTitle>
      <CardContent className="flex flex-col">
        {teamsWithProgress?.map((teamData) => (
          <div key={teamData.team.id} className="mb-8 flex items-center">
            <div className="flex gap-4 w-fit mr-8 sm:mr-0 sm:w-[30rem]">
              <div className="relative h-20 w-20">
                <Image
                  src={teamData.team.image_url || ""}
                  alt={teamData.team.name + " team image"}
                  fill
                  sizes="100%"
                  unoptimized
                  className="rounded-sm object-cover"
                />
              </div>
              <div className="hidden sm:flex items-center text-2xl">
                {teamData.team.name}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full mr-8">
              {teamData.progress.map((challenge, idx) => (
                <Progress
                  key={idx}
                  value={(challenge.quantity / challenge.required) * 100}
                  className={cn(
                    "w-full",
                    challenge.completed && "[&>div]:bg-blue-500"
                  )}
                />
              ))}
            </div>
            <div className="text-muted-foreground text-2xl text-nowrap w-[10rem] text-end">
              {teamData.complete ? (
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

export function TilePage({
  tile,
  teamProgresses,
}: TilePageProps): React.ReactElement {
  // Tasks are already in the correct order from the API
  const sortedTasks = tile.tasks;

  console.log(teamProgresses);

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
                src={tile.img_src || ""}
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
                  {sortedTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={cn(
                        "text-xl flex gap-4",
                        index < sortedTasks.length - 1 && "mb-8"
                      )}
                    >
                      <div className="text-muted-foreground min-w-fit">
                        Task {index + 1}:
                      </div>
                      <div>{task.name}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Tabs defaultValue="task1" className="w-full">
              <TabsList className="mb-4 py-6">
                {sortedTasks.map((task, index) => (
                  <TabsTrigger
                    key={task.id}
                    value={`task${index + 1}`}
                    className="px-8 h-10 text-md"
                  >
                    Task {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              {sortedTasks.map((task, index) => (
                <TabsContent
                  key={task.id}
                  value={`task${index + 1}`}
                  className="w-full"
                >
                  {getTaskTabContent(task, teamProgresses)}
                </TabsContent>
              ))}
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
