import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

function BingoBoardSkeleton() {
  return (
    <div className="w-full max-w-[80vw] lg:max-w-[min(calc(100vh-8rem),800px)] flex justify-center relative bg-background rounded-md border-2 border-bingo-grid">
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
    <div className="flex h-full w-full flex-col max-w-[80vw] lg:w-96 xl:w-120 mt-8 lg:mt-0">
      <span className="text-2xl text-foreground">Leaderboard</span>
      <span className="text-lg text-muted-foreground mb-2">
        Click a team to see their progress
      </span>
      <Card className="flex w-full h-[466px] flex-col gap-4 rounded-lg relative">
        <CardContent className="py-4 [&>*:not(:last-child)]:mb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex text-3xl gap-4 text-left items-center w-full p-4 box-border h-fit"
            >
              <div>{index + 1}</div>
              <Skeleton className="h-16 flex-1 rounded-sm" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RecentDropsSkeleton() {
  return (
    <div className="flex w-full flex-col items-start mt-12 min-w-0 max-w-[80vw]">
      <div className="flex w-full items-end justify-between mb-2">
        <div>
          <h2 className="text-2xl text-foreground">Recent Drops</h2>
          <p className="text-lg text-muted-foreground">
            All drops from the event
          </p>
        </div>
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
      <Card className="w-full p-6 flex justify-center">
        <Skeleton className="h-10 w-28 rounded-md" />
      </Card>
    </div>
  );
}

export default function Loading(): React.ReactElement {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Desktop layout */}
      <div className="hidden h-0 lg:flex lg:h-full flex-row items-start gap-8 w-full z-10 justify-center">
        <div className="flex flex-col min-w-0 flex-1 max-w-[80vw] lg:max-w-[min(calc(100vh-8rem),800px)]">
          <div className="mb-2">
            <h1 className="text-4xl font-bold">Winter Bingo 2026</h1>
            <Skeleton className="h-7 w-48" />
          </div>
          <BingoBoardSkeleton />
          <RecentDropsSkeleton />
        </div>
        <div className="flex flex-col gap-8 shrink-0">
          <LeaderboardSkeleton />
        </div>
      </div>
      {/* Mobile layout */}
      <div className="flex lg:hidden lg:h-0 w-full h-full flex-col items-center z-10">
        <div className="mb-2 w-full max-w-[80vw]">
          <h1 className="text-4xl font-bold">Winter Bingo 2026</h1>
          <Skeleton className="h-7 w-48" />
        </div>
        <BingoBoardSkeleton />
        <LeaderboardSkeleton />
        <RecentDropsSkeleton />
      </div>
    </div>
  );
}
