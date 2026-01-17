import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Loading(): React.ReactElement {
  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center">
      <div className="flex flex-col h-full w-full px-4 sm:px-0 my-4 sm:my-0">
        {/* Back button */}
        <Button
          asChild
          variant="outline"
          className="text-foreground mb-2 w-fit"
        >
          <Link href={"/bingo"}>
            <ArrowLeft /> Back
          </Link>
        </Button>

        <div className="flex flex-col h-full w-full">
          {/* Top section: Image and Task definitions */}
          <div className="flex gap-8 mb-24 flex-col sm:flex-row">
            {/* Tile image skeleton */}
            <div className="relative w-72 h-72 rounded-md mx-auto">
              <Skeleton className="w-full h-full rounded-md" />
            </div>

            {/* Title and task definitions */}
            <div className="flex flex-col items-start w-full">
              {/* Title skeleton - matches h1 text-4xl font-bold */}
              <div className="text-4xl font-bold mb-4 w-64 relative">
                <span className="invisible">&nbsp;</span>
                <Skeleton className="absolute inset-0" />
              </div>

              {/* Task definitions card skeleton */}
              <Card className="w-full h-full">
                <CardContent className="flex flex-col p-8 text-foreground">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className={cn("text-xl flex gap-4", index < 2 && "mb-8")}
                    >
                      <div className="text-muted-foreground min-w-fit">
                        Task {index + 1}:
                      </div>
                      <div className="flex-1 relative">
                        <span className="invisible">&nbsp;</span>
                        <Skeleton className="absolute inset-0" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Task tabs and progress section */}
          <Tabs defaultValue="task1" className="w-full">
            <div className="flex flex-col items-start gap-4 w-full">
              {/* Tab switcher - shown during loading */}

              <TabsList className="mb-2 py-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <TabsTrigger
                    key={index}
                    value={`task${index + 1}`}
                    className="px-8 h-10 text-md"
                  >
                    Task {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Progress section skeleton */}
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
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
