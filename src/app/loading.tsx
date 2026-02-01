import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function SplitCardSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <Skeleton className="h-5 w-24 ml-auto mb-1" />
      <Card className="w-full">
        <CardContent className="p-4 flex items-center">
          <div className="w-fit p-1 rounded-lg bg-accent mr-4">
            <Skeleton className="size-12 rounded-sm" />
          </div>
          <div className="flex flex-col w-fit max-w-64 xl:max-w-full gap-1">
            <Skeleton className="h-7 w-32 hidden sm:block" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center gap-2 ml-auto pl-4 sm:pl-0">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-7 w-12" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DiaryCardSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <Skeleton className="h-5 w-24 ml-auto mb-1" />
      <Card className="w-full">
        <CardContent className="p-4 flex items-baseline">
          <div className="flex items-start flex-col gap-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-7 w-16 ml-auto" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function Loading(): React.ReactElement {
  return (
    <div className="flex flex-col lg:flex-row gap-18 sm:gap-12 mb-12">
      <div className="flex flex-col gap-4 w-full lg:w-1/2">
        <h2 className="text-3xl text-foreground">Recent Splits</h2>
        {Array.from({ length: 10 }).map((_, i) => (
          <SplitCardSkeleton key={i} />
        ))}
      </div>
      <div className="flex flex-col gap-4 w-full lg:w-1/2">
        <h2 className="text-3xl text-foreground">Recent Diaries</h2>
        {Array.from({ length: 10 }).map((_, i) => (
          <DiaryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
