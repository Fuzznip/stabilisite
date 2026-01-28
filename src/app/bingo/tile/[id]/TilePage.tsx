"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ChallengeStatusProof,
  Task,
  TeamProgress,
  TileWithTasks,
  Trigger,
} from "@/lib/types/v2";
import { ProgressSkeleton } from "./ProgressSkeleton";
import { TileProgressProvider, useTileProgress } from "./TileProgressContext";
import { TeamTaskProgress } from "./TeamTaskProgressRedesign";

type TilePageProps = {
  tile: TileWithTasks;
  teamProgresses?: TeamProgress[] | null;
};

// Wrapper component that provides the context
export function TilePageWrapper({
  tile,
  children,
}: {
  tile: TileWithTasks;
  children?: React.ReactNode;
}) {
  return (
    <TileProgressProvider>
      <TilePageInner tile={tile} />
      {children}
    </TileProgressProvider>
  );
}

// Inner component that uses the context
function TilePageInner({ tile }: { tile: TileWithTasks }) {
  const { teamProgresses } = useTileProgress();
  return <TilePage tile={tile} teamProgresses={teamProgresses} />;
}

type ChallengeDisplayItem = {
  id: string;
  name: string | null;
  source: string | null;
  imgPath: string | null;
  value: number;
  quantity: number;
  required: number;
  completed: boolean;
  requireAll: boolean;
  isParent: boolean;
  children?: ChallengeDisplayItem[];
  trigger: Trigger;
};

type TeamTaskProgressData = {
  team: TeamProgress;
  complete: boolean | undefined;
  progress: ChallengeDisplayItem[];
  proofs: ChallengeStatusProof[];
};

function getTaskTabContent(
  task: Task,
  teamProgresses: TeamProgress[],
): React.ReactElement {
  const teamsWithProgress = teamProgresses
    ?.map((teamProgress) => {
      const taskStatus = teamProgress.task_statuses.find(
        (t) => t.task_id === task.id,
      );

      // Get all challenges for this task
      const allChallenges = teamProgress.challenge_statuses.filter(
        (challenge) => challenge.task_id === task.id,
      );

      // Collect all proofs from challenges for this task
      const proofs = allChallenges.flatMap(
        (challenge) => challenge.proofs || [],
      );

      // Recursively build challenge hierarchy
      const buildChallengeTree = (
        parentId: string | null,
      ): ChallengeDisplayItem[] => {
        return allChallenges
          .filter((c) => c.parent_challenge_id === parentId)
          .map((challenge) => {
            const children = buildChallengeTree(challenge.challenge_id);
            return {
              id: challenge.challenge_id,
              name: challenge.trigger?.name || null,
              imgPath: challenge.trigger?.img_path || null,
              source: challenge.trigger?.source || null,
              value: challenge.value,
              quantity: challenge.quantity,
              required: challenge.required,
              completed: challenge.completed,
              requireAll: challenge.require_all,
              isParent: children.length > 0,
              children: children.length > 0 ? children : undefined,
              trigger: challenge.trigger,
            };
          })
          .sort((a, b) => {
            // Sort by source first, then by name as tiebreaker
            const sourceA = a.source || "";
            const sourceB = b.source || "";
            const sourceCompare = sourceA.localeCompare(sourceB);

            if (sourceCompare !== 0) {
              return sourceCompare;
            }

            // If sources are the same, sort by name
            const nameA = a.name || "";
            const nameB = b.name || "";
            return nameA.localeCompare(nameB);
          });
      };

      const progress = buildChallengeTree(null);

      return {
        team: teamProgress,
        complete: taskStatus?.completed,
        progress,
        proofs,
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
          <TeamTaskProgress key={teamData.team.id} teamData={teamData} />
        ))}
      </CardContent>
    </Card>
  );
}

export function TilePage({
  tile,
  teamProgresses,
}: TilePageProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState("task1");

  // Tasks are already in the correct order from the API
  const sortedTasks = tile.tasks.sort((taskA, taskB) =>
    taskB.created_at.localeCompare(taskA.created_at),
  );

  // Memoize tab content to avoid recalculating on every render
  const tabContents = useMemo(() => {
    if (!teamProgresses) return null;
    return sortedTasks.map((task) => ({
      taskId: task.id,
      content: getTaskTabContent(task, teamProgresses),
    }));
  }, [sortedTasks, teamProgresses]);

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
            <div className="relative w-72 h-72 rounded-md mx-auto">
              <Image
                src={tile.img_src || ""}
                fill
                priority
                sizes="100%"
                className="object-contain"
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
                        index < sortedTasks.length - 1 && "mb-8",
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
            <Tabs
              defaultValue="task1"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
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
              {tabContents ? (
                tabContents.map((item, index) => (
                  <TabsContent
                    key={item.taskId}
                    value={`task${index + 1}`}
                    className="w-full"
                    forceMount
                    hidden={activeTab !== `task${index + 1}`}
                  >
                    {item.content}
                  </TabsContent>
                ))
              ) : (
                <ProgressSkeleton />
              )}
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
