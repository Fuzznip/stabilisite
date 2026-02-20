"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, X } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Task, TeamProgress, TileWithTasks, Trigger } from "@/lib/types/v2";
import { ProgressSkeleton } from "./ProgressSkeleton";
import { TileProgressProvider, useTileProgress } from "./TileProgressContext";
import { ProofImageDialog } from "@/components/ProofImageDialog";
import { PlayerBreakdownDialog } from "@/components/PlayerBreakdownDialog";

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
  required: number | null;
  completed: boolean;
  requireAll: boolean;
  isParent: boolean;
  children?: ChallengeDisplayItem[];
  trigger?: Trigger;
};

type EnrichedProof = {
  id: string;
  img_path: string | null;
  created_at: string;
  itemName: string | null;
  playerName: string | null;
  source: string | null;
  quantity: number;
  triggerType: string | null;
};

type TeamTaskProgressData = {
  team: TeamProgress;
  complete: boolean | undefined;
  progress: ChallengeDisplayItem[];
  proofs: EnrichedProof[];
};

const PROGRESS_CUTOFF = 4;

function BoldProgressBar({
  current,
  required,
  completed,
}: {
  current: number;
  required: number;
  completed: boolean;
}) {
  const percentage = Math.min((current / required) * 100, 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            completed
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "bg-gradient-to-r from-foreground/40 to-foreground/30",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between">
        <span
          className={cn(
            "text-2xl font-bold tabular-nums tracking-tight",
            completed ? "text-emerald-500" : "text-foreground",
          )}
        >
          {current.toLocaleString()}
        </span>
        <span className="text-lg text-muted-foreground tabular-nums">
          / {required.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function ItemGrid({ items }: { items: ChallengeDisplayItem[] }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((item) => {
        const hasNoRequirement = item.required == null;
        const isCompleted =
          item.completed || (hasNoRequirement && item.quantity >= 1);

        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <div className="relative group">
                <div
                  className={cn(
                    "relative size-20 rounded-lg border-2 transition-all duration-200",
                    isCompleted
                      ? "border-emerald-500 shadow-md shadow-emerald-500/20"
                      : "border-foreground/20 opacity-50 group-hover:opacity-75",
                  )}
                >
                  <Image
                    src={item.imgPath || ""}
                    alt={item.name || "Item"}
                    fill
                    sizes="80px"
                    unoptimized
                    className="rounded-md object-contain p-1"
                  />
                  {isCompleted && (
                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full p-1 shadow-md">
                      <Check className="size-4 text-white stroke-[3]" />
                    </div>
                  )}
                  {item.required != null && item.required > 1 && (
                    <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded-tl-lg rounded-br-md">
                      {item.quantity}/{item.required}
                    </div>
                  )}
                  {hasNoRequirement && item.quantity >= 1 && (
                    <div className="absolute bottom-0 right-0 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-tl-lg rounded-br-md">
                      {item.quantity}
                    </div>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {item.name}
              {item.value > 1 && ` (${item.value} pts)`}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

function ItemWithProgressBar({
  challenge,
}: {
  challenge: ChallengeDisplayItem;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border-2 transition-all",
        challenge.completed
          ? "bg-emerald-500/5 border-emerald-500/30"
          : "bg-muted/20 border-foreground/10",
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative size-20 flex-shrink-0 rounded-lg border-2 transition-all",
              challenge.completed
                ? "border-emerald-500 shadow-md shadow-emerald-500/20"
                : "border-foreground/20",
            )}
          >
            <Image
              src={challenge.imgPath || ""}
              alt={challenge.name || "Item"}
              fill
              sizes="80px"
              unoptimized
              className="rounded-md object-contain p-1"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>{challenge.name}</TooltipContent>
      </Tooltip>
      <div className="flex-1 flex flex-col gap-1">
        <div className="text-sm text-muted-foreground">{challenge.name}</div>
        <BoldProgressBar
          current={challenge.quantity}
          required={challenge.required ?? 0}
          completed={challenge.completed}
        />
      </div>
    </div>
  );
}

function MultiImageProgressBar({
  challenge,
}: {
  challenge: ChallengeDisplayItem;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border-2 transition-all",
        challenge.completed
          ? "bg-emerald-500/5 border-emerald-500/30"
          : "bg-muted/20 border-foreground/10",
      )}
    >
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        {challenge.children?.map((child) => (
          <Tooltip key={child.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "relative size-14 border-2 rounded-lg",
                  challenge.completed
                    ? "border-emerald-500"
                    : "border-foreground/20",
                )}
              >
                <Image
                  src={child.imgPath || ""}
                  alt={child.name || "Item"}
                  fill
                  sizes="56px"
                  unoptimized
                  className="rounded-md object-contain p-1"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{child.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="text-sm text-muted-foreground">
          {challenge.children?.map((c) => c.name).join(" or ")}
        </div>
        <BoldProgressBar
          current={challenge.quantity}
          required={challenge.required ?? 0}
          completed={challenge.completed}
        />
      </div>
    </div>
  );
}

function ChallengeDisplay({
  challenge,
}: {
  challenge: ChallengeDisplayItem;
}): React.ReactElement {
  if (challenge.isParent && challenge.children) {
    const hasNestedGroups = challenge.children.some((child) => child.isParent);
    const hasLargeQuantityChildren = challenge.children.some(
      (child) => (child.required ?? 0) > PROGRESS_CUTOFF,
    );
    const isKcWithMultipleTriggers =
      challenge.children.length > 1 &&
      challenge.children.every((child) => child.trigger?.type === "KC");

    if (
      isKcWithMultipleTriggers &&
      (challenge.required ?? 0) > PROGRESS_CUTOFF
    ) {
      return <MultiImageProgressBar challenge={challenge} />;
    }

    if (hasNestedGroups || hasLargeQuantityChildren) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {challenge.requireAll
                ? "Collect all"
                : `Any ${challenge.required}`}
            </span>
            {challenge.required != null && challenge.required > 1 && (
              <span className="text-xl font-bold tabular-nums">
                {challenge.quantity}/{challenge.required}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4 pl-4 border-l-2 border-foreground/20">
            {challenge.children.map((child) => (
              <ChallengeDisplay key={child.id} challenge={child} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "rounded-lg p-4 border-2",
          challenge.completed
            ? "bg-emerald-500/5 border-emerald-500/30"
            : "bg-muted/20 border-foreground/10",
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">
            {challenge.requireAll ? "Collect all" : `Any ${challenge.required}`}
          </span>
          {challenge.required != null && challenge.required > 1 && (
            <span className="text-lg font-bold tabular-nums">
              {challenge.quantity} / {challenge.required}
            </span>
          )}
        </div>
        <ItemGrid items={challenge.children} />
      </div>
    );
  }

  if ((challenge.required ?? 0) > PROGRESS_CUTOFF) {
    return <ItemWithProgressBar challenge={challenge} />;
  }

  const hasNoRequirement = challenge.required == null;
  const isCompleted =
    challenge.completed || (hasNoRequirement && challenge.quantity >= 1);

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border-2",
        isCompleted
          ? "bg-emerald-500/5 border-emerald-500/30"
          : "bg-muted/20 border-foreground/10",
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative size-20 flex-shrink-0 rounded-lg border-2 transition-all",
              isCompleted
                ? "border-emerald-500 shadow-md shadow-emerald-500/20"
                : "border-foreground/20 opacity-50",
            )}
          >
            <Image
              src={challenge.imgPath || ""}
              alt={challenge.name || "Item"}
              fill
              sizes="80px"
              unoptimized
              className="rounded-md object-contain p-1"
            />
            {isCompleted && (
              <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full p-1 shadow-md">
                <Check className="size-4 text-white stroke-[3]" />
              </div>
            )}
            {challenge.required != null && challenge.required > 1 && (
              <div className="absolute bottom-0 left-0 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded-tr-lg rounded-bl-md">
                {challenge.quantity}/{challenge.required}
              </div>
            )}
            {hasNoRequirement && challenge.quantity >= 1 && (
              <div className="absolute bottom-0 left-0 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-tr-lg rounded-bl-md">
                {challenge.quantity}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{challenge.name}</TooltipContent>
      </Tooltip>
      <div className="text-sm text-muted-foreground">{challenge.name}</div>
    </div>
  );
}

function TeamTaskProgress({ teamData }: { teamData: TeamTaskProgressData }) {
  // Determine if this is a KC/SKILL challenge based on trigger types in proofs
  const triggerType = teamData.proofs[0]?.triggerType;
  const showPlayerBreakdown =
    triggerType === "KC" || triggerType === "SKILL" || triggerType === "CHAT";

  // Calculate total required from progress (for KC/SKILL display)
  const totalRequired = teamData.progress.reduce(
    (sum, p) => sum + (p.required || 0),
    0,
  );

  // Filter proofs with images for the image dialog
  const proofsWithImages = teamData.proofs
    .filter(
      (proof): proof is EnrichedProof & { img_path: string } =>
        typeof proof.img_path === "string" && proof.img_path.length > 0,
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative size-20 rounded-lg overflow-hidden border-2 border-foreground/20 shadow-md flex-shrink-0">
          <Image
            src={teamData.team.image_url || ""}
            alt={teamData.team.name + " team image"}
            fill
            sizes="80px"
            unoptimized
            className="object-cover"
          />
        </div>

        <h3 className="text-2xl font-bold tracking-tight flex-1">
          {teamData.team.name}
        </h3>

        {showPlayerBreakdown ? (
          <PlayerBreakdownDialog
            proofs={teamData.proofs}
            title="Player Breakdown"
            total={totalRequired > 0 ? totalRequired : undefined}
            iconSize={6}
          />
        ) : (
          <ProofImageDialog
            images={proofsWithImages.map((proof) => ({
              src: proof.img_path,
              timestamp: new Date(proof.created_at),
              itemName: proof.itemName || undefined,
              playerName: proof.playerName || undefined,
              source: proof.source || undefined,
            }))}
            title="Proof Images"
            iconSize={6}
          />
        )}

        {teamData.complete ? (
          <div className="bg-emerald-500 rounded-full p-2 shadow-lg shadow-emerald-500/30">
            <Check className="size-6 text-white stroke-[3]" />
          </div>
        ) : (
          <div className="bg-red-900/80 rounded-full p-2 shadow-lg shadow-red-900/20">
            <X className="size-6 text-red-200 stroke-[3]" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 pl-0 sm:pl-24">
        {teamData.progress.map((challenge) => (
          <ChallengeDisplay key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}

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

      // Collect all proofs from challenges for this task, enriched with item names, player names, and sources
      const proofs: EnrichedProof[] = allChallenges.flatMap((challenge) =>
        (challenge.proofs || []).map((proof) => ({
          id: proof.id,
          img_path: proof.img_path,
          created_at: proof.created_at,
          itemName: proof.action?.name || challenge.trigger?.name || null,
          playerName: proof.action?.player?.runescape_name || null,
          source: proof.action?.source || challenge.trigger?.source || null,
          quantity: proof.action?.quantity || 0,
          triggerType: challenge.trigger?.type || null,
        })),
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
    <div className="flex flex-col h-full w-full px-2 sm:px-0 mb-4 sm:my-0">
      <Button asChild variant="outline" className="text-foreground mb-2 w-fit">
        <Link href={`/bingo/${tile.event_id}`}>
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
              <TabsList className="mb-4 py-6 w-full sm:w-fit">
                {sortedTasks.map((task, index) => (
                  <TabsTrigger
                    key={task.id}
                    value={`task${index + 1}`}
                    className="px-8 h-10 text-md grow"
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
