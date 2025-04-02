"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatDate, getScaleDisplay } from "@/lib/utils";
import { User } from "next-auth";
import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Camera } from "lucide-react";
import { DiaryApplication, ShortDiary } from "../lib/types";

export default function Diaries({
  user,
  diaries,
  entries,
}: {
  user?: User | null;
  diaries: ShortDiary[];
  entries: DiaryApplication[];
}): React.ReactElement {
  const [currentDiary, setCurrentDiary] = useState(diaries[0].name);
  const [currentScale, setCurrentScale] = useState<{
    scale: string;
    shorthand: string;
  } | null>(diaries[0].scales[0]);

  const currentAttempts = entries
    .filter((entry) => entry.shorthand === currentScale?.shorthand)
    .sort((attemptA, attemptB) => attemptA.time.localeCompare(attemptB.time));

  const selectedDiary = diaries.find((diary) => diary.name === currentDiary);

  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Diaries</h2>
      <Card className="flex flex-col gap-4 p-4 min-h-72">
        <div className="flex gap-4 sm:gap-12 w-full flex-col sm:flex-row">
          <div className="flex gap-2 flex-col">
            <Label className="text-muted-foreground">Diary</Label>
            <Select
              value={currentDiary}
              onValueChange={(value) => {
                setCurrentDiary(value);
                const newDiary = diaries.find((d) => d.name === value);
                if (
                  newDiary &&
                  !newDiary.scales
                    .map((scale) => scale.scale)
                    .includes(currentScale?.scale || "")
                ) {
                  setCurrentScale(newDiary.scales[0]);
                }
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

        <Table>
          {!currentAttempts.length && (
            <TableCaption className="w-full w-max-24 text-lg mt-6 mb-4">
              {user
                ? `You have no submitted ${currentDiary} (${currentScale}) times.`
                : `There are no entries submitted for ${currentDiary} (${currentScale})`}
            </TableCaption>
          )}
          <TableHeader>
            <TableRow className="text-lg">
              <TableHead className="text-muted-foreground">Rank</TableHead>
              <TableHead className="text-muted-foreground">Time</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Team</TableHead>
              <TableHead className="text-muted-foreground">Proof</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xl">
            {currentAttempts.map((attempt, index) => (
              <TableRow key={attempt.date.getTime()}>
                <TableCell
                  className={cn(
                    "font-extrabold",
                    index === 0 && "text-yellow-500 text-3xl",
                    index === 1 && "text-gray-500 text-3xl",
                    index === 2 && "text-yellow-800 text-3xl",
                    index > 2 && "text-muted-foreground"
                  )}
                >
                  {index + 1}
                </TableCell>
                <TableCell>{attempt.time}</TableCell>
                <TableCell>{formatDate(attempt.date)}</TableCell>
                <TableCell
                  className={cn(
                    attempt.teamMembers?.length && "flex flex-col items-start"
                  )}
                >
                  {attempt.teamMembers?.map((teammate) => (
                    <span
                      key={`${teammate}-${attempt.date.getTime()}`}
                      className="mt-1"
                    >
                      {teammate}
                    </span>
                  ))}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" asChild className="text-3xl">
                    <Link href={attempt.proof || ""} className="w-auto h-auto">
                      <Camera className="!size-6" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}
