"use client";

import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect } from "react";
import { useNewDrop } from "../_hooks/useNewDrop";
import { toast } from "sonner";
import { useTeams } from "../_hooks/useTeams";
import { useRelativeTime } from "../_hooks/useRelativeTime";
import { X } from "lucide-react";
import { Drop } from "@/lib/types/drop";

export default function DropToaster(): React.ReactElement {
  const { newDrop } = useNewDrop();
  const { teams } = useTeams();

  useEffect(() => {
    if (newDrop) {
      const team = teams.find((team) =>
        team.members
          .map((member) => member.toLowerCase())
          .includes(newDrop?.player.toLowerCase() || "")
      );

      toast.custom(
        (id) => (
          <div className="relative flex w-full items-center gap-4 rounded-md border bg-background p-4 shadow-lg">
            {/* Close button in top-right corner */}
            <button
              onClick={() => toast.dismiss(id)}
              className="absolute top-4 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Toast Content */}
            <div className="flex flex-col w-full gap-6">
              <div className="flex gap-4">
                {/* Team Captain Image */}
                <div className="relative h-16 w-16">
                  <Image
                    src={`/${team?.captain.toLowerCase()}.png`}
                    alt={team?.name + " team image"}
                    fill
                    sizes="100%"
                    unoptimized
                    className="rounded-sm object-cover"
                  />
                </div>

                {/* Player & Team Info */}
                <div className="flex flex-col">
                  <span className="text-xl text-foreground capitalize">
                    {newDrop?.player}
                  </span>
                  <span className="text-lg text-muted-foreground capitalize">
                    {team?.name}
                  </span>
                </div>
              </div>

              {/* Item Name */}
              <div className="flex flex-col text-2xl text-foreground">
                <div>
                  {newDrop.itemName
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </div>
                <DropToasterDate drop={newDrop} />
              </div>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          className: "w-full sm:w-80",
        }
      );
    }
  }, [newDrop, teams]);
  return <Toaster />;
}

function DropToasterDate({ drop }: { drop: Drop }): React.ReactElement {
  const relativeTime = useRelativeTime(drop.date);
  return (
    <div className="text-muted-foreground text text-base">{relativeTime}</div>
  );
}
