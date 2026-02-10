"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { cn, rank_colors } from "@/lib/utils";
import { useState } from "react";
import { User } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import Link from "next/link";
import { Trophy, Medal, Award } from "lucide-react";

const PAGE_SIZE = 10;

const podiumConfig = [
  { icon: Trophy, color: "text-yellow-500 dark:text-yellow-400" },
  { icon: Medal, color: "text-slate-400 dark:text-slate-300" },
  { icon: Award, color: "text-amber-700 dark:text-amber-500" },
] as const;

export default function ClanPointTable({ users }: { users: User[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const currentUsers = users.slice(start, start + PAGE_SIZE);

  const windowSize = 1;

  function getVisiblePages(current: number, total: number) {
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      const left = Math.max(2, current - windowSize);
      const right = Math.min(total - 1, current + windowSize);

      pages.push(1);
      if (left > 2) pages.push("…");

      for (let i = left; i <= right; i++) pages.push(i);

      if (right < total - 1) pages.push("…");
      pages.push(total);
    }

    return pages;
  }

  const visiblePages = getVisiblePages(page, totalPages);

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
              {currentUsers.map((user, index) => {
                const globalIndex = start + index;
                const rank = rank_colors.find(
                  (rank) => rank.name === (user?.rank || "Guest")
                );
                const podium =
                  globalIndex < 3 ? podiumConfig[globalIndex] : null;
                const PodiumIcon = podium?.icon;

                return (
                  <TableRow
                    key={`${user.discordId}-clanPoints`}
                    className={cn(
                      "h-14 transition-colors",
                      globalIndex < 3 && "bg-muted/10",
                    )}
                  >
                    <TableCell className="w-16">
                      {podium && PodiumIcon ? (
                        <PodiumIcon
                          className={cn("h-5 w-5", podium.color)}
                        />
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground tabular-nums">
                          {globalIndex + 1}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/profile/${user.runescapeName}`}
                        className="font-medium hover:underline"
                      >
                        {user.runescapeName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right sm:text-left">
                      <span className="font-bold tabular-nums">
                        {Math.trunc(user.rankPoints || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="relative size-5 shrink-0">
                          <Image
                            src={`/${rank?.name.toLowerCase()}.png`}
                            alt={`${rank?.name.toLowerCase()} rank`}
                            className="object-contain"
                            sizes="20px"
                            fill
                          />
                        </div>
                        <span
                          className={cn(
                            "text-sm capitalize font-medium",
                            rank?.textColor,
                            "dark:brightness-150 brightness-90",
                          )}
                        >
                          {rank?.name}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="border-t p-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((prev) => Math.max(prev - 1, 1));
                    }}
                  />
                </PaginationItem>
                {visiblePages.map((p, i) => (
                  <PaginationItem key={i}>
                    {typeof p === "string" ? (
                      <span className="px-2 text-muted-foreground">…</span>
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={page === p}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((prev) => Math.min(prev + 1, totalPages));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </section>
  );
}
