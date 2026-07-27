"use client";

import { DiaryApplication, ShortDiary } from "@/lib/types";
import {
  getScaleDisplay,
  cn,
  formatDate,
  formatDiaryTime,
  parseDiaryTimeToSeconds,
} from "@/lib/utils";
import { Camera, Check, Info } from "lucide-react";
import { useState } from "react";
import { Card } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Scale = ShortDiary["scales"][number];

// Renders "2:10" from a raw number of seconds (used for the gap to the next tier).
function formatGap(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function DiaryTable({
  diaries,
  entries,
}: {
  diaries: ShortDiary[];
  entries: DiaryApplication[];
}): React.ReactElement {
  const [currentDiary, setCurrentDiary] = useState(diaries[0].name);
  const [currentScale, setCurrentScale] = useState<Scale | null>(
    diaries[0].scales[0]
  );

  const selectedDiary = diaries.find((diary) => diary.name === currentDiary);
  const selectedScale =
    selectedDiary?.scales.find(
      (scale) => scale.scale === currentScale?.scale
    ) ?? null;

  // The user's accepted attempts for this diary + scale, fastest first.
  const attempts = entries
    .filter((entry) => entry.shorthand === selectedScale?.shorthand)
    .sort(
      (a, b) =>
        (parseDiaryTimeToSeconds(a.time) ?? Infinity) -
        (parseDiaryTimeToSeconds(b.time) ?? Infinity)
    );
  const bestAttempt = attempts[0];
  const bestSeconds = parseDiaryTimeToSeconds(bestAttempt?.time);

  const targets = selectedScale?.times ?? [];
  // Tiers arrive slowest -> fastest. Achieved tiers are the slowest ones, so the
  // fastest achieved tier is the user's current standing and the first locked
  // tier is their next target.
  const fastestAchievedTime = targets
    .filter(
      (target) =>
        bestSeconds != null &&
        (parseDiaryTimeToSeconds(target.diaryTime) ?? Infinity) >= bestSeconds
    )
    .at(-1)?.diaryTime;
  const nextTargetTime = targets.find(
    (target) =>
      bestSeconds == null ||
      (parseDiaryTimeToSeconds(target.diaryTime) ?? Infinity) < bestSeconds
  )?.diaryTime;

  return (
    <section className="flex flex-col w-full h-full">
      <h2 className="text-2xl mb-2">Diaries</h2>
      <Card className="flex flex-col gap-4 p-4 min-h-72 h-full">
        <div className="flex gap-4 md:gap-12 w-full flex-col md:flex-row">
          <div className="flex gap-2 flex-col">
            <Label className="text-muted-foreground">Diary</Label>
            <Select
              value={currentDiary}
              onValueChange={(value) => {
                setCurrentDiary(value);
                const newDiary = diaries.find((d) => d.name === value);
                const matchingScale = newDiary?.scales.find(
                  (scale) => scale.scale === currentScale?.scale
                );
                setCurrentScale(matchingScale || newDiary?.scales[0] || null);
              }}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select diary" />
              </SelectTrigger>
              <SelectContent>
                {diaries.map((diary) => (
                  <SelectItem key={diary.name} value={diary.name}>
                    {diary.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 flex-col">
            <Label className="text-muted-foreground">Scale</Label>
            <Select
              value={currentScale?.scale}
              onValueChange={(value) =>
                setCurrentScale(
                  selectedDiary?.scales.find(
                    (scale) => scale.scale === value
                  ) || null
                )
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select scale">
                  <span className="capitalize">
                    {getScaleDisplay(currentScale?.scale || "")}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {selectedDiary?.scales.map((scale) => (
                  <SelectItem
                    key={scale.scale}
                    value={scale.scale}
                    className="capitalize"
                  >
                    {getScaleDisplay(scale.scale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Best time:{" "}
            <span className="font-semibold text-foreground">
              {bestAttempt ? formatDiaryTime(bestAttempt.time) : "No time yet"}
            </span>
          </span>
          {attempts.length > 0 && <AttemptsInfo attempts={attempts} />}
        </div>

        {targets.length ? (
          <ul className="flex flex-col gap-1 overflow-auto">
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
                    !achieved && !isNext && "text-muted-foreground"
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
                      <span className="text-xs text-stability">
                        (-{formatGap(gap)})
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      achieved && "text-green-600 dark:text-green-500",
                      isNext && "text-stability"
                    )}
                  >
                    +{target.diaryPoints.toLocaleString()} pts
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-muted-foreground text-sm mt-2">
            {`No clan point targets for ${currentDiary} (${getScaleDisplay(
              currentScale?.scale || ""
            )})`}
          </div>
        )}
      </Card>
    </section>
  );
}

function AttemptsInfo({
  attempts,
}: {
  attempts: DiaryApplication[];
}): React.ReactElement {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground"
        >
          <Info className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-72 overflow-auto p-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-popover">
            <tr className="text-muted-foreground text-xs text-left">
              <th className="font-normal px-3 py-2">Time</th>
              <th className="font-normal px-3 py-2">Date</th>
              <th className="font-normal px-3 py-2">Team</th>
              <th className="font-normal px-3 py-2">Proof</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt, index) => (
              <tr
                key={`${attempt.id ?? attempt.time}-${index}`}
                className="border-t"
              >
                <td className="px-3 py-2 font-mono whitespace-nowrap">
                  {formatDiaryTime(attempt.time)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDate(attempt.date || new Date())}
                </td>
                <td className="px-3 py-2 capitalize">
                  {attempt.party?.length ? attempt.party.join(", ") : "—"}
                </td>
                <td className="px-3 py-2">
                  {attempt.proof ? (
                    <Link
                      href={attempt.proof}
                      target="_blank"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Camera className="size-4" />
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PopoverContent>
    </Popover>
  );
}
