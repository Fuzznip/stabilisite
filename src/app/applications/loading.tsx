import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ApplicationCardSkeleton() {
  return (
    <Card className="border px-4 pt-2 pb-4 rounded-lg flex flex-col w-96 h-fit">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex flex-col gap-4 h-[24rem]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <Skeleton className="h-4 w-48 mb-1" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
      <div className="w-fit flex items-center gap-2 ml-auto mt-2 h-10">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </Card>
  );
}

export default function Loading(): React.ReactElement {
  return (
    <div className="flex flex-col gap-8 mx-auto sm:mx-0">
      <h1 className="text-3xl font-bold">Applications</h1>
      <Tabs defaultValue="clan">
        <TabsList className="py-1 h-auto mb-4 flex items-center gap-4 w-fit">
          <TabsTrigger value="clan" className="flex items-center text-lg">
            <span>Clan</span>
            <Skeleton className="ml-2 h-5 w-6 rounded-full" />
          </TabsTrigger>
          <TabsTrigger value="diary" className="flex items-center text-lg">
            <span>Diary</span>
            <Skeleton className="ml-2 h-5 w-6 rounded-full" />
          </TabsTrigger>
          <TabsTrigger value="raids" className="flex items-center text-lg">
            <span>Raid Tier</span>
            <Skeleton className="ml-2 h-5 w-6 rounded-full" />
          </TabsTrigger>
          <TabsTrigger value="ranks" className="flex items-center text-lg">
            <span>Rank</span>
            <Skeleton className="ml-2 h-5 w-6 rounded-full" />
          </TabsTrigger>
        </TabsList>
        <ul className="flex items-center flex-wrap gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </ul>
      </Tabs>
    </div>
  );
}
