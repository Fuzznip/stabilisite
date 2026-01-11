"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, X } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Task, TeamProgress, TileWithTasks } from "@/lib/types/v2";

type TilePageProps = {
  tile: TileWithTasks;
  teamProgresses: TeamProgress[];
};

type ChallengeDisplayItem = {
  id: string;
  name: string | null;
  source: string | null;
  imgPath: string | null;
  quantity: number;
  required: number;
  completed: boolean;
  requireAll: boolean;
  isParent: boolean;
  children?: ChallengeDisplayItem[];
};

const PROGRESS_CUTOFF = 4;

function ChallengeDisplay({
  challenge,
}: {
  challenge: ChallengeDisplayItem;
}): React.ReactElement {
  // Parent challenge with children (grouping)
  if (challenge.isParent && challenge.children) {
    // Check if children also have children (nested grouping)
    const hasNestedGroups = challenge.children.some((child) => child.isParent);
    // Check if any children have quantity > PROGRESS_CUTOFF
    const hasLargeQuantityChildren = challenge.children.some(
      (child) => child.required > PROGRESS_CUTOFF
    );

    if (hasNestedGroups || hasLargeQuantityChildren) {
      // Grandparent level - render nested groups
      return (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>
              {challenge.requireAll
                ? "Collect all"
                : `Any ${challenge.required}`}
            </span>
            <span className="ml-auto text-lg">
              {challenge.quantity}/{challenge.required}
            </span>
          </div>
          <div className="flex flex-col gap-4 pl-4 border-l-2 border-foreground/20">
            {challenge.children.map((child) => (
              <ChallengeDisplay key={child.id} challenge={child} />
            ))}
          </div>
        </div>
      );
    }

    // Parent level with item children - render items grid
    return (
      <div
        className={cn(
          "rounded-lg p-4 border-2",
          challenge.completed
            ? "bg-green-500/10 border-green-500/50"
            : "bg-muted/30 border-muted"
        )}
      >
        <div className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
          <span>
            {challenge.requireAll ? "Collect all" : `Any ${challenge.required}`}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {challenge.children.map((child) => (
            <Tooltip key={child.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "relative size-20 border-2 rounded transition-all",
                    child.completed
                      ? "border-green-500"
                      : "border-foreground/50"
                  )}
                >
                  <Image
                    src={child.imgPath || ""}
                    alt={child.name || "Item"}
                    fill
                    sizes="100%"
                    unoptimized
                    className={cn(
                      "rounded-sm object-contain p-1",
                      !child.completed && "opacity-50"
                    )}
                  />
                  {child.completed && (
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <Check className="size-4 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-black/70 text-white text-sm px-2 py-1 rounded-tl rounded-br">
                    {child.quantity}/{child.required}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{child.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }

  // Leaf challenge (single item)
  if (challenge.required > PROGRESS_CUTOFF) {
    // Progress bar for large numbers
    return (
      <div
        className={cn(
          "flex items-center gap-4 w-full rounded-lg p-4 border-2",
          challenge.completed
            ? "bg-green-500/10 border-green-500/50"
            : "bg-muted/30 border-muted"
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "relative size-20 border rounded flex-shrink-0",
                challenge.completed
                  ? "border-green-500"
                  : "border-foreground/50"
              )}
            >
              <Image
                src={challenge.imgPath || ""}
                alt={challenge.name || "Item"}
                fill
                sizes="100%"
                unoptimized
                className="rounded-sm object-contain p-1"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>{challenge.name}</TooltipContent>
        </Tooltip>
        <div className="flex flex-col gap-2 flex-1">
          <div className="text-sm text-muted-foreground">{challenge.name}</div>
          <Progress
            value={(challenge.quantity / challenge.required) * 100}
            className={cn(
              "w-full",
              challenge.completed && "[&>div]:bg-green-500"
            )}
          />
          <div className="text-sm text-muted-foreground text-right">
            {challenge.quantity.toLocaleString()} /{" "}
            {challenge.required.toLocaleString()}
          </div>
        </div>
      </div>
    );
  }

  // Single item with quantity
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border-2",
        challenge.completed
          ? "bg-green-500/10 border-green-500/50"
          : "bg-muted/30 border-muted"
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative size-20 border-2 rounded transition-all",
              challenge.completed ? "border-green-500" : "border-foreground/50"
            )}
          >
            <Image
              src={challenge.imgPath || ""}
              alt={challenge.name || "Item"}
              fill
              sizes="100%"
              unoptimized
              className={cn(
                "rounded-sm object-contain p-1",
                !challenge.completed && "opacity-50"
              )}
            />
            {challenge.completed && (
              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                <Check className="size-4 text-white" />
              </div>
            )}
            {challenge.required > 1 && (
              <div className="absolute bottom-0 left-0 bg-black/70 text-white text-sm px-2 py-1 rounded-tl rounded-br">
                {challenge.quantity}/{challenge.required}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{challenge.name}</TooltipContent>
      </Tooltip>
      <div className="text-sm">{challenge.name}</div>
    </div>
  );
}

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

      // Recursively build challenge hierarchy
      const buildChallengeTree = (
        parentId: string | null
      ): ChallengeDisplayItem[] => {
        return allChallenges
          .filter((c) => c.parent_challenge_id === parentId)
          .map((challenge) => {
            const children = buildChallengeTree(challenge.challenge_id);
            return {
              id: challenge.challenge_id,
              name: challenge.trigger?.name || null,
              imgPath: challenge.trigger?.img_path || null,
              source: challenge.trigger.source || null,
              quantity: challenge.quantity,
              required: challenge.required,
              completed: challenge.completed,
              requireAll: challenge.require_all,
              isParent: children.length > 0,
              children: children.length > 0 ? children : undefined,
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
          <div key={teamData.team.id} className="mb-12 flex flex-col gap-2">
            <div className="flex gap-4 w-full mr-8 sm:mr-0 items-center">
              <div className="relative size-20 rounded">
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
              <div className="text-muted-foreground text-2xl text-nowrap w-fit h-fit ml-auto">
                {teamData.complete ? (
                  <Check className="size-12 text-blue-800 ml-auto" />
                ) : (
                  <X className="size-12 h-16 text-red-800 ml-auto" />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-6 w-full pl-0 sm:pl-24">
              {teamData.progress.map((challenge) => (
                <div key={challenge.id} className="flex flex-col gap-2">
                  <ChallengeDisplay challenge={challenge} />
                </div>
              ))}
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
