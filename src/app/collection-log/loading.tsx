import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading(): React.ReactElement {
  return (
    <div className="flex w-full h-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Card className="flex flex-col md:flex-row gap-0 p-0 overflow-hidden h-[40rem]">
        <div className="md:w-64 shrink-0 md:border-r p-3 flex flex-col gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2">
            {Array.from({ length: 40 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
