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
      <div className="w-full flex flex-col">
        <h2 className="text-2xl font-bold mb-0">Clan Points</h2>
        <p className="text-muted-foreground mb-2">
          Click a name to view their profile
        </p>
      </div>
      <Card className="flex flex-col gap-4 p-4 min-h-72 h-full">
        <Table className="w-full sm:table-fixed">
          <TableHeader>
            <TableRow className="text-lg">
              <TableHead className="text-muted-foreground">Place</TableHead>
              <TableHead className="text-muted-foreground">Points</TableHead>
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xl">
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className="h-16">
                <TableCell>
                  <Skeleton className="h-6 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="w-48 sm:w-auto">
                  <Skeleton className="h-6 w-32" />
                </TableCell>
                <TableCell className="flex items-center my-auto h-16">
                  <Skeleton className="size-6 mr-2 rounded-full" />
                  <Skeleton className="h-6 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
