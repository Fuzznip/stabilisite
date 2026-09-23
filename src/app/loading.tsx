import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the homepage's real layout — hero, stat row, then the activity
 *  feed — so the page doesn't reflow into a different shape once it resolves. */

function RowSkeleton() {
  return (
    <li className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
      <Skeleton className="size-2 shrink-0 rounded-full" />
      <Skeleton className="size-11 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-40 max-w-full" />
        <Skeleton className="h-3.5 w-28 max-w-full" />
      </div>
      <Skeleton className="h-6 w-12 shrink-0" />
      <Skeleton className="h-3 w-8 shrink-0" />
    </li>
  );
}

export default function Loading(): React.ReactElement {
  return (
    <div className="flex flex-col gap-12 pb-12">
      <section className="pt-10 pb-2 sm:pt-16">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-4 h-16 w-72 max-w-full sm:h-20 lg:h-24" />
        <Skeleton className="mt-5 h-6 w-full max-w-xl" />
        <Skeleton className="mt-2 h-6 w-64 max-w-full" />
        <div className="mt-8 flex flex-wrap gap-3">
          <Skeleton className="h-10 w-44 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </section>

      <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-xl border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 px-6 py-5"
          >
            <Skeleton className="h-9 w-24 sm:h-10" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-3 w-28" />
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {Array.from({ length: 8 }).map((_, index) => (
            <RowSkeleton key={index} />
          ))}
        </ul>
      </section>
    </div>
  );
}
