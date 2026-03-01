"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import { TeamWithMembers } from "@/lib/types/v2";

type WinnerBannerProps = {
  winner: TeamWithMembers;
};

export default function WinnerBanner({ winner }: WinnerBannerProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border-2 border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-amber-400/5 to-yellow-600/10 mb-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(234,179,8,0.06)_50%,transparent_60%)]" />
      </div>

      <div className="relative flex flex-row items-center gap-4 p-5 sm:p-6">
        {/* Team image */}
        {winner.image_url && (
          <div className="relative shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-md overflow-hidden border-2 border-yellow-500/40">
            <Image
              src={winner.image_url}
              alt={winner.name}
              fill
              sizes="96px"
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600 dark:text-yellow-400">
              Winner
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            {winner.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            wins with{" "}
            <span className="font-bold text-foreground tabular-nums">
              {winner.points}
            </span>{" "}
            points
          </p>
        </div>
      </div>
    </div>
  );
}
