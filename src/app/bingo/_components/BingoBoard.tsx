"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TeamProgressResponse, TileProgress, Tile } from "@/lib/types/v2";

export default function BingoBoard({
  tiles,
  progress,
}: {
  tiles: Tile[];
  progress?: TeamProgressResponse;
}) {
  return (
    <div className="w-full flex justify-center relative bg-background rounded-md border-2 border-bingo-grid">
      {/* <Image
        src="/bingo_bg.png"
        className="absolute object-cover"
        fill
        alt=""
      /> */}
      <div className="grid grid-cols-5 grid-auto-rows-[1fr] gap-0 w-full z-10">
        {tiles
          .sort((tileA, tileB) => tileA.index - tileB.index)
          .map((tile) => {
            const tileProgress = progress?.find((p) => p.index === tile.index);
            return (
              <BingoCard key={tile.index} tile={tile} progress={tileProgress} />
            );
          })}
      </div>
    </div>
  );
}

function BingoCard({
  tile,
  progress,
}: {
  tile?: Tile;
  progress?: TileProgress;
}): React.ReactElement {
  const medalSrc = progress
    ? getMedalSrcForMedalLevel(progress.status.medal_level)
    : undefined;
  return (
    <Card className="rounded-none border-2 border-bingo-grid bg-transparent shadow-none relative w-full h-full aspect-square">
      <CardContent
        className={cn(
          "relative w-full h-full p-0",
          "transition-transform duration-300 ease-in-out cursor-pointer transform hover:z-50 shadow-none hover:shadow-[0_0_20px_rgba(255,255,255,0.75)] hover:rounded-sm"
        )}
      >
        <Link
          href={`/bingo/tile/${tile?.id}`}
          className="relative h-full w-full flex"
        >
          <Image
            src={tile?.img_src || ""}
            fill
            priority
            sizes="100%"
            className="object-contain"
            alt={`${tile?.name} tile image`}
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

function getMedalSrcForMedalLevel(
  medalLevel: "none" | "bronze" | "silver" | "gold"
): string {
  if (medalLevel === "bronze") {
    return "/bronze_medal.png";
  } else if (medalLevel === "silver") {
    return "/silver_medal.png";
  } else if (medalLevel === "gold") {
    return "/gold_medal.png";
  }
  return "";
}
