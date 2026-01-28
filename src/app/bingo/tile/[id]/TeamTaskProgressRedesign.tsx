"use client";

import Image from "next/image";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ProofImageDialog } from "@/components/ProofImageDialog";
import { ChallengeStatusProof, TeamProgress, Trigger } from "@/lib/types/v2";

/**
 * REDESIGNED TEAM TASK PROGRESS COMPONENT
 *
 * Design Philosophy: Arena Scoreboard
 * - Bold typography hierarchy with dramatic scale
 * - Asymmetric layout breaking card monotony
 * - Color as data signal (vibrant = complete, monochrome = incomplete)
 * - Generous whitespace for visual breathing room
 * - Data-forward presentation where numbers drive the design
 */

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

const PROGRESS_CUTOFF = 4;

/**
 * Bold Progress Bar Component
 * Height: 12px (up from standard 8px) for prominence
 * Typography: Large, tabular numbers positioned strategically
 */
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
              : "bg-gradient-to-r from-foreground/40 to-foreground/30"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between">
        <span
          className={cn(
            "text-2xl font-bold tabular-nums tracking-tight",
            completed ? "text-emerald-500" : "text-foreground"
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

/**
 * Item Grid Display
 * Bold checkmarks with emerald accent
 */
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
                      : "border-foreground/20 opacity-50 group-hover:opacity-75"
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
                  {item.required > 1 && (
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

/**
 * Single Item with Progress Bar (Hybrid Display)
 * Used for quantity-based challenges with images
 */
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
          : "bg-muted/20 border-foreground/10"
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative size-20 flex-shrink-0 rounded-lg border-2 transition-all",
              challenge.completed
                ? "border-emerald-500 shadow-md shadow-emerald-500/20"
                : "border-foreground/20"
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
        <div className="text-sm text-muted-foreground">
          {challenge.name}
        </div>
        <BoldProgressBar
          current={challenge.quantity}
          required={challenge.required}
          completed={challenge.completed}
        />
      </div>
    </div>
  );
}

/**
 * Multi-Image Progress Bar Display
 * For KC challenges with multiple trigger images
 */
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
          : "bg-muted/20 border-foreground/10"
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
                    : "border-foreground/20"
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
          required={challenge.required}
          completed={challenge.completed}
        />
      </div>
    </div>
  );
}

/**
 * Challenge Display Router
 * Determines which visualization to use based on challenge structure
 */
function ChallengeDisplay({
  challenge,
}: {
  challenge: ChallengeDisplayItem;
}): React.ReactElement {
  // Parent challenge with children (grouping)
  if (challenge.isParent && challenge.children) {
    const hasNestedGroups = challenge.children.some((child) => child.isParent);
    const hasLargeQuantityChildren = challenge.children.some(
      (child) => child.required > PROGRESS_CUTOFF
    );
    const isKcWithMultipleTriggers =
      challenge.children.length > 1 &&
      challenge.children.every((child) => child.trigger?.type === "KC");

    // KC parent with multiple triggers and large quantity
    if (isKcWithMultipleTriggers && challenge.required > PROGRESS_CUTOFF) {
      return <MultiImageProgressBar challenge={challenge} />;
    }

    // Nested grouping structure
    if (hasNestedGroups || hasLargeQuantityChildren) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {challenge.requireAll
                ? "Collect all"
                : `Any ${challenge.required}`}
            </span>
            {challenge.required > 1 && (
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

    // Parent with item children - grid layout
    return (
      <div
        className={cn(
          "rounded-lg p-4 border-2",
          challenge.completed
            ? "bg-emerald-500/5 border-emerald-500/30"
            : "bg-muted/20 border-foreground/10"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">
            {challenge.requireAll ? "Collect all" : `Any ${challenge.required}`}
          </span>
          {challenge.required > 1 && (
            <span className="text-lg font-bold tabular-nums">
              {challenge.quantity} / {challenge.required}
            </span>
          )}
        </div>
        <ItemGrid items={challenge.children} />
      </div>
    );
  }

  // Leaf challenge with large quantity - progress bar
  if (challenge.required > PROGRESS_CUTOFF) {
    return <ItemWithProgressBar challenge={challenge} />;
  }

  // Single item with small quantity - simplified display
  const hasNoRequirement = challenge.required == null;
  const isCompleted =
    challenge.completed || (hasNoRequirement && challenge.quantity >= 1);

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border-2",
        isCompleted
          ? "bg-emerald-500/5 border-emerald-500/30"
          : "bg-muted/20 border-foreground/10"
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative size-20 flex-shrink-0 rounded-lg border-2 transition-all",
              isCompleted
                ? "border-emerald-500 shadow-md shadow-emerald-500/20"
                : "border-foreground/20 opacity-50"
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
            {challenge.required > 1 && (
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

/**
 * Main Team Task Progress Component
 * Bold, asymmetric layout with dramatic typography
 */
export function TeamTaskProgress({
  teamData,
}: {
  teamData: TeamTaskProgressData;
}) {
  return (
    <div className="mb-12">
      {/* Team Identity Section - with inline status */}
      <div className="flex items-center gap-4 mb-6">
        {/* Team image */}
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

        {/* Team name */}
        <h3 className="text-2xl font-bold tracking-tight flex-1">
          {teamData.team.name}
        </h3>

        {/* Proof images button */}
        <ProofImageDialog
          images={teamData.proofs
            .filter((proof) => proof.img_path?.length > 0)
            .map((proof) => ({
              src: proof.img_path,
              timestamp: new Date(proof.created_at),
            }))}
          title={`${teamData.team.name} - Proof Images`}
          iconSize={6}
        />

        {/* Status indicator - inline with team name */}
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

      {/* Progress Display */}
      <div className="flex flex-col gap-5 pl-0 sm:pl-24">
        {teamData.progress.map((challenge) => (
          <ChallengeDisplay key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}
