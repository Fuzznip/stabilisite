"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChartBarIncreasing,
  Swords,
  NotebookPen,
  Coins,
} from "lucide-react";
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

type DialogKey = "rank" | "raidTier" | "diary" | "split";

export function SubmitPopoverClient({ user, diaries, entries, raids, filteredRanks }: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState<DialogKey | null>(null);

  // Close the menu, then open the chosen dialog. The dialogs render as siblings
  // of the Popover (below), not inside it, so the two never stack on top of each
  // other and the popover can't intercept clicks inside the dialog.
  const openFrom = (key: DialogKey) => {
    setPopoverOpen(false);
    setOpenDialog(key);
  };

  const dialogOpenChange = (key: DialogKey) => (open: boolean) =>
    setOpenDialog(open ? key : null);

  const menuItems: { key: DialogKey; label: string; icon: React.ReactNode }[] = [
    { key: "rank", label: "Rank", icon: <ChartBarIncreasing className="size-4 mr-1" /> },
    { key: "raidTier", label: "Raid Tier", icon: <Swords className="size-4 mr-1" /> },
    { key: "diary", label: "Diary", icon: <NotebookPen className="size-4 mr-1" /> },
    { key: "split", label: "Split", icon: <Coins className="size-4 mr-1" /> },
  ];

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild className="mr-4">
          <Button className="flex items-center gap-1 bg-stability hover:bg-stability/90 text-white">
            Submit
            <ChevronDown className="w-4 h-4 hidden sm:flex" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-2">
          <div className="flex flex-col">
            {menuItems.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                className="w-full justify-start px-6"
                onClick={() => openFrom(item.key)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <RankDialog
        ranks={filteredRanks}
        user={user}
        open={openDialog === "rank"}
        onOpenChange={dialogOpenChange("rank")}
      />
      <RaidTierDialog
        raids={raids}
        open={openDialog === "raidTier"}
        onOpenChange={dialogOpenChange("raidTier")}
      />
      <DiaryDialog
        user={user}
        diaries={diaries}
        entries={entries}
        open={openDialog === "diary"}
        onOpenChange={dialogOpenChange("diary")}
      />
      <SplitDialog
        open={openDialog === "split"}
        onOpenChange={dialogOpenChange("split")}
      />
    </>
  );
}
