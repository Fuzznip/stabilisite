import { DiaryTimeTarget } from "@/lib/types";
import { cn, formatDiaryTime, parseDiaryTimeToSeconds } from "@/lib/utils";
import { Check } from "lucide-react";

// Renders "2:10" from a raw number of seconds (used for the gap to the next tier).
function formatGap(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/**
 * A ladder of clan point targets for a single diary + scale, shared between the
 * profile Diaries section and the submission dialog. Tiers are expected slowest
 * -> fastest. A tier is achieved when the best time clears it; the fastest
 * achieved tier is the current standing (green) and the slowest unachieved tier
 * is the next target (red, with the remaining time gap).
 */
export function DiaryTargetLadder({
  targets,
  bestTime,
  className,
}: {
  targets: DiaryTimeTarget[];
  bestTime?: string | null;
  className?: string;
}): React.ReactElement | null {
  if (!targets.length) return null;

  const bestSeconds = parseDiaryTimeToSeconds(bestTime);
  const fastestAchievedTime = targets
    .filter(
      (target) =>
        bestSeconds != null &&
        (parseDiaryTimeToSeconds(target.diaryTime) ?? Infinity) >= bestSeconds,
    )
    .at(-1)?.diaryTime;
  const nextTargetTime = targets.find(
    (target) =>
      bestSeconds == null ||
      (parseDiaryTimeToSeconds(target.diaryTime) ?? Infinity) < bestSeconds,
  )?.diaryTime;

  return (
    <ul className={cn("flex flex-col gap-1", className)}>
      {targets.map((target) => {
        const targetSeconds = parseDiaryTimeToSeconds(target.diaryTime);
        const achieved =
          bestSeconds != null &&
          targetSeconds != null &&
          bestSeconds <= targetSeconds;
        const isCurrent = target.diaryTime === fastestAchievedTime;
        const isNext = target.diaryTime === nextTargetTime;
        const gap =
          isNext && bestSeconds != null && targetSeconds != null
            ? bestSeconds - targetSeconds
            : null;
        return (
          <li
            key={target.diaryTime}
            className={cn(
              "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm",
              isCurrent && "bg-green-600/10 dark:bg-green-500/10",
              isNext && "bg-stability/10",
              !achieved && !isNext && "text-muted-foreground",
            )}
          >
            <span className="flex items-center gap-2">
              {achieved ? (
                <Check className="size-4 text-green-600 dark:text-green-500" />
              ) : (
                <span className="size-4" />
              )}
              <span className="font-mono">
                {formatDiaryTime(target.diaryTime)}
              </span>
              {isNext && gap != null && (
                <span className="text-xs text-stability-accent">
                  (-{formatGap(gap)})
                </span>
              )}
            </span>
            <span
              className={cn(
                "font-semibold",
                achieved && "text-green-600 dark:text-green-500",
                isNext && "text-stability-accent",
              )}
            >
              +{target.diaryPoints.toLocaleString()} points
            </span>
          </li>
        );
      })}
    </ul>
  );
}
