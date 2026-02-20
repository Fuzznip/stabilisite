import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

function BingoBoardSkeleton() {
  return (
    <div className="w-full max-w-[90vw] sm:max-w-[80vw] lg:max-w-[min(calc(100vh-8rem),800px)] flex justify-center relative bg-background rounded-md border-2 border-bingo-grid">
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
    <div className="flex h-full w-full flex-col max-w-[90vw] sm:max-w-[80vw] lg:w-96 xl:w-120 mt-8 lg:mt-2">
      <span className="text-2xl font-bold text-foreground">Leaderboard</span>
      <p className="text-lg text-muted-foreground mb-2">
        Click a team to see members
      </p>
      <Card className="flex w-full flex-col rounded-lg overflow-hidden">
        <CardContent className="p-0 divide-y divide-border">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4"
            >
              <div className="w-8 shrink-0 flex justify-center">
                {index < 3 ? (
                  <Skeleton className="h-6 w-6 rounded-md" />
                ) : (
                  <Skeleton className="h-5 w-5 rounded" />
                )}
              </div>
              <Skeleton className="h-16 w-16 shrink-0 rounded" />
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-3.5 w-20 rounded" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Skeleton className="h-5 w-12 rounded" />
                <Skeleton className="h-3.5 w-6 rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RecentDropsSkeleton() {
  return (
    <div className="flex w-full flex-col items-start mt-12 min-w-0 max-w-[90vw] sm:max-w-[80vw]">
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
        <div className="mb-2 w-full max-w-[90vw] sm:max-w-[80vw]">
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
