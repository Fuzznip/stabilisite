"use client";

import { Card } from "@/lib/components/ui/card";
import { Label } from "@/lib/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/components/ui/table";
import { cn, diaries, formatDate } from "@/lib/utils";
import { User } from "next-auth";
import { useState } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";
import useDiaryAttempts from "../hooks/useDiaryAttempts";
import { Button } from "./ui/button";

export default function Diaries({
  user,
}: {
  user?: User | null;
}): React.ReactElement {
  const attempts = useDiaryAttempts(user);
  const [currentDiary, setCurrentDiary] = useState(diaries[0].name);
  const [currentScale, setCurrentScale] = useState(diaries[0].scales[0]);

  const currentAttempts = attempts
    .filter(
      (attempt) =>
        attempt.diary === currentDiary && attempt.scale === currentScale
    )
    .sort((attemptA, attemptB) => attemptA.time.localeCompare(attemptB.time));

  const selectedDiary = diaries.find((diary) => diary.name === currentDiary);

  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Diaries</h2>
      <Card className="flex flex-col gap-4 p-4 min-h-72">
        <div className="flex gap-12 w-full">
          <div className="flex gap-2 flex-col">
            <Label className="text-muted-foreground">Diary</Label>
            <Select
              value={currentDiary}
              onValueChange={(value) => {
                setCurrentDiary(value);
                const newDiary = diaries.find((d) => d.name === value);
                if (newDiary && !newDiary.scales.includes(currentScale)) {
                  setCurrentScale(newDiary.scales[0]);
                }
              }}
            >
              <SelectTrigger className="w-64">
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
              value={currentScale}
              onValueChange={(value) => setCurrentScale(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select scale">
                  <span className="capitalize">{currentScale}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {selectedDiary?.scales.map((scale) => (
                  <SelectItem key={scale} value={scale} className="capitalize">
                    {scale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          {!currentAttempts.length && (
            <TableCaption className="w-full w-max-24">
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
              <TableRow key={attempt.id}>
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
                <TableCell className="flex flex-col items-start">
                  {attempt.team.map((teammate) => (
                    <span key={`${attempt.id}-${teammate}`}>{teammate}</span>
                  ))}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" asChild>
                    <Link href={attempt.proof}>
                      <Camera />
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
