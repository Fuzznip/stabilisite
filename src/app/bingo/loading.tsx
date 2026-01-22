import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

function BingoBoardSkeleton() {
  return (
    <div className="w-full max-w-[80vh] flex justify-center relative bg-background rounded-md border-2 border-bingo-grid">
      <Image
        src="/bingo_bg.png"
        alt=""
        className="absolute inset-0 object-fill opacity-20 z-10"
        fill
      />
      <div className="grid grid-cols-5 grid-auto-rows-[1fr] gap-0 w-full z-10">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="rounded-none border-[2px] border-bingo-grid bg-transparent shadow-none relative w-full h-full aspect-square"
          >
            <Skeleton className="absolute inset-0 rounded-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="flex h-full flex-col sm:min-w-[30rem] flex-shrink-0 -mt-18">
      <span className="text-3xl text-foreground">Leaderboard</span>
      <span className="text-xl text-muted-foreground mb-2">
        Click a team to see their progress
      </span>
      <Card className="flex w-full h-full flex-col gap-4 rounded-lg relative">
        <CardContent className="py-4 [&>*:not(:last-child)]:mb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex text-3xl gap-4 text-left items-center w-full h-fit p-4 box-border"
            >
              <div>{index + 1}</div>
              <Skeleton className="h-20 flex-1 rounded-sm" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Loading(): React.ReactElement {
  return (
    <>
      <div className="mb-2 z-10">
        <h1 className="text-4xl font-bold">Winter Bingo 2026</h1>
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="hidden lg:flex w-full h-full flex-row items-start justify-start gap-8 z-10">
        <BingoBoardSkeleton />
        <LeaderboardSkeleton />
      </div>
      <div className="flex lg:hidden w-full h-full flex-col justify-center items-center gap-8 pb-12 z-10">
        <BingoBoardSkeleton />
        <LeaderboardSkeleton />
      </div>
    </>
  );
}
