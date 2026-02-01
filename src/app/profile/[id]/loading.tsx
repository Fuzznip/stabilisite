import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

function ProfileHeaderSkeleton() {
  return (
    <div className="flex gap-8 items-center">
      <Skeleton className="size-20 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  );
}

function RankAndStatsSkeleton() {
  return (
    <section className="flex flex-col w-full xl:w-1/2">
      <h2 className="text-2xl mb-2">Rank & Stats</h2>
      <Card className="p-4 sm:pl-8 bg-card w-full sm:h-72 h-auto flex flex-col sm:flex-row items-center gap-2">
        <div className="flex flex-col items-start sm:w-1/2 xl:w-full h-full justify-center sm:gap-12">
          <div className="flex flex-col w-fit">
            <h3 className="text-xl font-semibold mb-2">Rank</h3>
            <div className="flex items-center mb-4 lg:mb-0">
              <Skeleton className="size-10 mr-2 rounded-full" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <div className="flex flex-col w-fit">
            <h3 className="text-xl font-semibold mb-2">Stats</h3>
            <div className="flex items-center w-full text-4xl">
              <div className="flex items-center w-1/2 justify-center border-r-2 border-border pr-4 mr-4">
                <Skeleton className="size-8 mr-2 rounded-full" />
                <Skeleton className="h-9 w-12" />
              </div>
              <div className="flex items-center w-1/2 justify-center">
                <Skeleton className="size-8 mr-2 rounded-full" />
                <Skeleton className="h-9 w-16" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:w-1/2 xl:w-[250px] items-start xl:items-center">
          <Skeleton className="size-48 rounded-full" />
        </div>
      </Card>
    </section>
  );
}

function RaidTiersSkeleton() {
  return (
    <section className="flex flex-col w-full xl:w-1/2">
      <h2 className="text-2xl mb-2">Raid Tiers</h2>
      <div className="flex w-full items-start justify-between h-72 flex-col">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="w-full h-21 flex relative rounded-lg overflow-hidden"
          >
            <Skeleton className="absolute inset-0" />
          </Card>
        ))}
      </div>
    </section>
  );
}

function AchievementsSkeleton() {
  return (
    <section className="flex flex-col w-full xl:w-1/2 xl:h-80">
      <h2 className="text-2xl mb-2">Achievements</h2>
      <div className="flex flex-row items-center flex-wrap w-full gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="w-full sm:w-48 h-16 flex relative rounded-lg overflow-hidden"
          >
            <Skeleton className="absolute inset-0" />
          </Card>
        ))}
      </div>
    </section>
  );
}

function DiariesSkeleton() {
  return (
    <div className="xl:h-80 w-full xl:w-1/2">
      <Skeleton className="h-8 w-24 mb-2" />
      <Card className="p-4">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

function SplitChartSkeleton() {
  return (
    <section className="flex flex-col w-full">
      <Skeleton className="h-8 w-32 mb-4" />
      <Skeleton className="h-72 w-full rounded-lg" />
    </section>
  );
}

export default function Loading(): React.ReactElement {
  return (
    <>
      <Skeleton className="h-10 w-64 mb-4" />
      <ProfileHeaderSkeleton />
      <div className="flex flex-col gap-12 mt-8">
        <div className="flex justify-between flex-col xl:flex-row gap-8">
          <RankAndStatsSkeleton />
          <RaidTiersSkeleton />
        </div>
        <div className="flex justify-between flex-col xl:flex-row gap-8">
          <AchievementsSkeleton />
          <DiariesSkeleton />
        </div>
        <SplitChartSkeleton />
      </div>
    </>
  );
}
