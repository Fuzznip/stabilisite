"use client";

import { DiaryApplication, ShortDiary } from "@/lib/types";
import {
  getScaleDisplay,
  formatDate,
  formatDiaryTime,
  parseDiaryTimeToSeconds,
} from "@/lib/utils";
import { Camera, Info } from "lucide-react";
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
import { DiaryTargetLadder } from "./DiaryTargetLadder";

type Scale = ShortDiary["scales"][number];

/**
 * Profile diary section: for the profile's user, shows their best time per diary
 * + scale and a ladder of clan point targets (achieved / current / next). This is
 * distinct from the cross-player leaderboard rendered by DiaryTable.
 */
export function DiaryProgress({
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
  const targets = selectedScale?.times ?? [];

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
          <DiaryTargetLadder
            targets={targets}
            bestTime={bestAttempt?.time}
            className="overflow-auto"
          />
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
