import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 px-4 pb-20 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 items-start">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
