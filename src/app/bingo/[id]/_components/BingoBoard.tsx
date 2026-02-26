import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { TeamProgressResponse, TileProgress, Tile } from "@/lib/types/v2";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BingoBoard({
  tiles,
  progress,
  isLoading,
}: {
  tiles: Tile[];
  progress?: TeamProgressResponse;
  isLoading?: boolean;
}) {
  return (
    <div className="w-full max-w-[90vw] sm:max-w-[80vw] lg:max-w-[min(calc(100vh-8rem),800px)] flex justify-center relative bg-background rounded-md border-2 border-bingo-grid">
      <Image
        src="/bingo_bg.png"
        alt=""
        className="absolute inset-0 object-fill opacity-20 z-10"
        fill
      />
      <div className="grid grid-cols-5 grid-auto-rows-[1fr] gap-0 w-full z-10">
        {tiles
          .sort((tileA, tileB) => tileA.index - tileB.index)
          .map((tile) => {
            const tileProgress = progress?.find((p) => p.index === tile.index);
            return (
              <BingoCard
                key={tile.index}
                tile={tile}
                progress={tileProgress}
                isLoading={isLoading}
              />
            );
          })}
      </div>
    </div>
  );
}

function BingoCard({
  tile,
  progress,
  isLoading,
}: {
  tile?: Tile;
  progress?: TileProgress;
  isLoading?: boolean;
}): React.ReactElement {
  const medalSrc = progress
    ? getMedalSrcForMedalLevel(progress.status.medal_level)
    : undefined;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="rounded-none border-2 border-bingo-grid bg-transparent shadow-none relative w-full h-full aspect-square">
          <CardContent
            className={cn(
              "relative w-full h-full p-0",
              "transition-transform duration-300 ease-in-out cursor-pointer transform hover:z-50 shadow-none hover:shadow-[0_0_20px_rgba(255,255,255,0.75)] hover:rounded-sm",
            )}
          >
            <Link
              href={`/bingo/${tile?.event_id}/tile/${tile?.id}`}
              prefetch={false}
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
              {isLoading && !progress && (
                <div className="absolute bottom-0 left-0 aspect-square size-1/2 flex items-center justify-center">
                  <Loader2 className="size-2/3 animate-spin text-stability stroke-3" />
                </div>
              )}
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
      </TooltipTrigger>
      <TooltipContent>{tile?.name}</TooltipContent>
    </Tooltip>
  );
}

function getMedalSrcForMedalLevel(
  medalLevel: "none" | "bronze" | "silver" | "gold",
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
