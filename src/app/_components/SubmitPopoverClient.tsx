"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { DiaryDialog } from "./DiaryDialog";
import { SplitDialog } from "./SplitDialog";
import { RaidTierDialog } from "./RaidTierDialog";
import { RankDialog } from "./RankDialog";
import type { User, ShortDiary, DiaryApplication, Raid, Rank } from "@/lib/types";

interface Props {
  user: User | null;
  diaries: ShortDiary[];
  entries: DiaryApplication[];
  raids: Raid[];
  filteredRanks: Rank[];
}

export function SubmitPopoverClient({ user, diaries, entries, raids, filteredRanks }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild className="mr-4">
        <Button className="flex items-center gap-1 bg-stability hover:bg-stability/90 text-white">
          Submit
          <ChevronDown className="w-4 h-4 hidden sm:flex" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2">
        <div className="flex flex-col">
          <RankDialog ranks={filteredRanks} user={user} />
          <RaidTierDialog raids={raids} />
          <DiaryDialog user={user} diaries={diaries} entries={entries} />
          <SplitDialog />
        </div>
      </PopoverContent>
    </Popover>
  );
}
