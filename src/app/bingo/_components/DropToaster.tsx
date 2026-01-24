"use client";

import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect, useState } from "react";
import { useNewDrop } from "../_hooks/useNewDrop";
import { toast } from "sonner";
import { useRelativeTime } from "../_hooks/useRelativeTime";
import { X, XCircle } from "lucide-react";
import { Drop } from "@/lib/types/drop";
import { Team } from "@/lib/types/v2";
import { revalidateBingoProgress } from "../actions";
import { useRecentDrops } from "./RecentDropsStore";
import { Button } from "@/components/ui/button";

export default function DropToaster({
  teams,
}: {
  teams: Team[];
}): React.ReactElement {
  const { newDrop } = useNewDrop();
  const { addDrop } = useRecentDrops();
  const [lastDropId, setLastDropId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (newDrop && teams.length > 0 && newDrop.id !== lastDropId) {
      setLastDropId(newDrop.id);
      const team = teams.find((team) =>
        team.members
          .map((member) => member.toLowerCase())
          .includes(newDrop?.player.toLowerCase() || ""),
      );

      // Add the new drop to the recent drops list
      addDrop(newDrop);

      // Revalidate progress cache so next navigation gets fresh data
      revalidateBingoProgress();
      toast.custom(
        (id) => (
          <div className="relative flex w-full items-center gap-4 rounded-md border bg-background p-4 shadow-lg">
            <button
              onClick={() => toast.dismiss(id)}
              className="absolute top-4 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex flex-col w-full gap-6">
              <div className="flex gap-4">
                <div className="relative h-16 w-16">
                  <Image
                    src={`${team?.image_url}`}
                    alt={team?.name + " team image"}
                    fill
                    sizes="100%"
                    unoptimized
                    className="rounded-sm object-cover"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-xl text-foreground capitalize">
                    {newDrop?.player}
                  </span>
                  <span className="text-lg text-muted-foreground capitalize">
                    {team?.name}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col text-2xl text-foreground">
                  <div>
                    {newDrop.submitType === "SKILL" && `${newDrop.quantity} `}
                    {newDrop.itemName
                      .toLowerCase()
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}

                    {newDrop.submitType === "KC" && " KC"}
                    {newDrop.submitType === "SKILL" && " XP"}
                  </div>
                  <DropToasterDate drop={newDrop} />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.getToasts().forEach((t) => toast.dismiss(t.id));
                  }}
                  className="flex items-center gap-1 text-sm text-card-foreground hover:text-foreground w-fit bg-card"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          className: "w-full sm:w-80",
        },
      );
      toast.custom(
        (id) => (
          <div className="relative flex w-full items-center gap-4 rounded-md border bg-background p-4 shadow-lg">
            <button
              onClick={() => toast.dismiss(id)}
              className="absolute top-4 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex flex-col w-full gap-6">
              <div className="flex gap-4">
                <div className="relative h-16 w-16">
                  <Image
                    src={`${team?.image_url}`}
                    alt={team?.name + " team image"}
                    fill
                    sizes="100%"
                    unoptimized
                    className="rounded-sm object-cover"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-xl text-foreground capitalize">
                    {newDrop?.player}
                  </span>
                  <span className="text-lg text-muted-foreground capitalize">
                    {team?.name}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col text-2xl text-foreground">
                  <div>
                    {newDrop.submitType === "SKILL" && `${newDrop.quantity} `}
                    {newDrop.itemName
                      .toLowerCase()
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}

                    {newDrop.submitType === "KC" && " KC"}
                    {newDrop.submitType === "SKILL" && " XP"}
                  </div>
                  <DropToasterDate drop={newDrop} />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.getToasts().forEach((t) => toast.dismiss(t.id));
                  }}
                  className="flex items-center gap-1 text-sm text-card-foreground hover:text-foreground w-fit bg-card"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          className: "w-full sm:w-80",
        },
      );
    }
  }, [addDrop, lastDropId, newDrop, teams]);

  return <Toaster />;
}

function DropToasterDate({ drop }: { drop: Drop }): React.ReactElement {
  const relativeTime = useRelativeTime(drop.date);
  return (
    <div className="text-muted-foreground text text-base">{relativeTime}</div>
  );
}
