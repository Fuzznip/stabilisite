import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 px-4 pb-20 w-full">
      {/* Mirrors BossHeader: boss image on the left, title block beside it.
          The point breakdown is collapsed on load, so nothing stands in for
          it here. */}
      <div className="flex items-start gap-5">
        <Skeleton className="size-28 shrink-0 rounded-xl sm:size-36 lg:size-44" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-72" />
          <Skeleton className="mt-3 h-8 w-44" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-32" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
