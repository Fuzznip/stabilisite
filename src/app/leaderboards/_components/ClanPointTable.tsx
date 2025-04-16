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
import { ranks, cn } from "@/lib/utils";
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

const PAGE_SIZE = 10;

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
            {currentUsers.map((user, index) => {
              const globalIndex = start + index;
              const rank = ranks.find(
                (rank) => rank.name === (user?.rank || "Guest")
              );
              return (
                <TableRow key={`${user.discordId}-clanPoints`} className="h-16">
                  <TableCell
                    className={cn(
                      "font-extrabold",
                      globalIndex === 0 && "text-yellow-500 text-3xl",
                      globalIndex === 1 && "text-gray-500 text-3xl",
                      globalIndex === 2 && "text-yellow-800 text-3xl",
                      globalIndex > 2 && "text-muted-foreground"
                    )}
                  >
                    {globalIndex + 1}
                  </TableCell>
                  <TableCell>
                    {Math.trunc(user.rankPoints || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="w-48 sm:w-auto">
                    <Link
                      href={`/profile/${user.runescapeName}`}
                      className="hover:underline"
                    >
                      {user.runescapeName}
                    </Link>
                  </TableCell>
                  <TableCell className="flex items-center my-auto h-16">
                    <div className="relative size-6 mr-2">
                      <Image
                        src={`/${rank?.name.toLowerCase()}.png`}
                        alt={`${rank?.name.toLowerCase()} rank`}
                        className="absolute object-contain"
                        sizes="100%"
                        fill
                      />
                    </div>
                    <div
                      className={`capitalize ${rank?.textColor} dark:brightness-150 brightness-90`}
                    >
                      {rank?.name}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <Pagination className="mt-4">
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
        )}
      </Card>
    </section>
  );
}
