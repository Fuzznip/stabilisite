import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading(): React.ReactElement {
  return (
    <div className="w-full h-full flex">
      <Card className="bg-background text-foreground shadow-xl mx-auto mt-12 max-w-lg h-fit px-4 py-2">
        <CardHeader className="pb-2">
          <div className="text-3xl flex items-center gap-2 flex-col sm:flex-row">
            <span>Welcome to Stability,</span>
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground">
            Apply to the clan by submitting the form below
          </p>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
            <Skeleton className="h-10 w-full rounded-md mt-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
