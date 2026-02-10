import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ClanPointTableSkeleton() {
  return (
    <section className="flex flex-col w-full h-full">
      <div className="w-full flex flex-col mb-3">
        <h2 className="text-2xl font-bold">Clan Points</h2>
        <p className="text-sm text-muted-foreground">
          Click a name to view their profile
        </p>
      </div>
      <Card className="flex flex-col p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full sm:table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right sm:text-left">
                  Points
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">
                  Rank
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index} className="h-14">
                  <TableCell className="w-16">
                    {index < 3 ? (
                      <Skeleton className="h-5 w-5 rounded" />
                    ) : (
                      <Skeleton className="h-4 w-5 rounded" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28 rounded" />
                  </TableCell>
                  <TableCell className="text-right sm:text-left">
                    <Skeleton className="h-4 w-14 rounded" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-5 rounded-full" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </section>
  );
}

function DiaryTableSkeleton() {
  return (
    <section className="flex flex-col w-full">
      <Skeleton className="h-8 w-32 mb-2" />
      <Card className="p-4">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    </section>
  );
}

export default function Loading(): React.ReactElement {
  return (
    <div className="flex w-full h-full flex-col gap-12">
      <ClanPointTableSkeleton />
      <DiaryTableSkeleton />
    </div>
  );
}
