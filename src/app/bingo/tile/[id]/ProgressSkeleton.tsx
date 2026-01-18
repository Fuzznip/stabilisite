import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export function ProgressSkeleton(): React.ReactElement {
  return (
    <Card className="w-full">
      <CardTitle className="text-3xl p-8 font-normal mb-4 flex flex-col gap-2 sm:flex-row sm:gap-0">
        <span className="mr-4">Task:</span>
        <div className="w-64 relative">
          <span className="invisible">&nbsp;</span>
          <Skeleton className="absolute inset-0" />
        </div>
      </CardTitle>
      <CardContent className="flex flex-col">
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  );
}
