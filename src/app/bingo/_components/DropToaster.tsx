"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { useNewDrop } from "../_hooks/useNewDrop";
import { toast } from "sonner";
import { useRelativeTime } from "../_hooks/useRelativeTime";
import { X } from "lucide-react";
import { Drop } from "@/lib/types/drop";
import { Team } from "@/lib/types/v2";
import { revalidateBingoProgress } from "../actions";
import { useRecentDrops } from "./RecentDropsStore";
import { Button } from "@/components/ui/button";

export default function DropToaster({
  teams,
  eventId,
}: {
  teams: Team[];
  eventId: string;
}): React.ReactElement {
  const { newDrop } = useNewDrop(eventId);
  const { addDrop } = useRecentDrops();
  const lastDropIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (newDrop && teams.length > 0 && newDrop.id !== lastDropIdRef.current) {
      lastDropIdRef.current = newDrop.id;

      // Look up team by ID if available (new format), otherwise fall back to player name lookup
      const team = newDrop.teamId
        ? teams.find((t) => t.id === newDrop.teamId)
        : teams.find((t) =>
            t.members
              .map((m) => m.toLowerCase())
              .includes(newDrop.player.toLowerCase()),
          );

      // Show playerRsn in parentheses if different from submitted RSN
      const showAltName =
        newDrop.playerRsn &&
        newDrop.playerRsn.toLowerCase() !== newDrop.player.toLowerCase();

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
                {team?.image_url && (
                  <div className="relative h-20 w-20">
                    <Image
                      src={team.image_url}
                      alt={team.name + " team image"}
                      fill
                      sizes="80px"
                      unoptimized
                      className="rounded-sm object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="text-xl text-foreground capitalize">
                    {newDrop.player}
                    {showAltName && (
                      <span className="text-muted-foreground">
                        {" "}
                        ({newDrop.playerRsn})
                      </span>
                    )}
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
                <ClearAllButton toastId={id} />
              </div>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          className: "w-100 sm:w-100",
        },
      );
    }
  }, [addDrop, newDrop, teams]);

  return <></>;
}

function DropToasterDate({ drop }: { drop: Drop }): React.ReactElement {
  const relativeTime = useRelativeTime(drop.date);
  return (
    <div className="text-muted-foreground text text-base">{relativeTime}</div>
  );
}

function ClearAllButton({ toastId }: { toastId: string | number }) {
  const [isTopToast, setIsTopToast] = useState(false);

  useEffect(() => {
    // Check immediately and on any toast changes
    const checkIfTop = () => {
      const toasts = toast.getToasts();
      // Show on the most recent (last) toast when there are multiple
      setIsTopToast(
        toasts[toasts.length - 1]?.id === toastId && toasts.length > 1,
      );
    };

    checkIfTop();

    // Re-check periodically since sonner doesn't expose a subscription
    const interval = setInterval(checkIfTop, 100);
    return () => clearInterval(interval);
  }, [toastId]);

  if (!isTopToast) return null;

  return (
    <Button
      variant="outline"
      onClick={() => {
        toast.getToasts().forEach((t) => toast.dismiss(t.id));
      }}
      className="flex items-center gap-1 text-sm text-card-foreground hover:text-foreground w-fit bg-card"
    >
      Clear All
    </Button>
  );
}
