import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center gap-6">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="w-[80vw] rounded" style={{ aspectRatio: "459/211" }} />
      <div className="flex gap-3 flex-wrap justify-center">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-28" />
        ))}
      </div>
    </div>
  );
}
