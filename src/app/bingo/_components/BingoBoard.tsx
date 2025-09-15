"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSelectedTeam } from "../_hooks/useSelectedTeam";
import Link from "next/link";
import { MedalTier } from "@/lib/types/bingo";

export default function BingoBoard() {
  return (
    <div className="w-full md:w-[90%] lg:w-3/4 flex justify-center max-w-[900px]">
      <div className="grid grid-cols-5 grid-auto-rows-[1fr] gap-1 p-1 bg-bingo-grid rounded-md w-full">
        {Array.from({ length: 25 }).map((_, index) => {
          return <BingoCard key={index} index={index} />;
        })}
      </div>
    </div>
  );
}

function BingoCard({ index }: { index: number }): React.ReactElement {
  const { selectedTeam } = useSelectedTeam();
  const medalSrc = selectedTeam
    ? getMedalSrcForTier(selectedTeam.board_state[index])
    : undefined;
  return (
    <Card
      key={index}
      className="rounded-sm border border-bingo-grid bg-bingo-grid shadow-none relative w-full h-full aspect-square"
    >
      <CardContent
        className={cn(
          "relative w-full h-full p-0",
          "transition-transform duration-300 ease-in-out cursor-pointer transform hover:z-50 shadow-none hover:shadow-[0_0_20px_rgba(255,255,255,0.75)] hover:rounded-sm"
        )}
      >
        <Link
          href={`/bingo/tile/${index}`}
          className="relative h-full w-full flex"
        >
          <Image
            src={`/${index}.jpg`}
            fill
            priority
            sizes="100%"
            className="object-cover"
            alt={`Tile ${index} image`}
          />
          {medalSrc && (
            <div className="absolute bottom-0 left-0 aspect-square h-1/2">
              <Image
                src={medalSrc}
                fill
                sizes="100%"
                className="object-contain drop-shadow-[5px_5px_5px_rgba(0,0,0,0.5)]"
                alt="Bronze Medal"
              />
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}

function getMedalSrcForTier(tier: MedalTier): string {
  if (tier === MedalTier.Bronze) {
    return "/bronze_medal.png";
  } else if (tier === MedalTier.Silver) {
    return "/silver_medal.png";
  } else if (tier === MedalTier.Gold) {
    return "/gold_medal.png";
  }
  return "";
}
