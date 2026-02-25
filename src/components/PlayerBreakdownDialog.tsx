"use client";

import { useMemo, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 10;

type ProofData = {
  playerName: string | null;
  quantity: number;
  created_at: string;
};

type PlayerBreakdownDialogProps = {
  proofs: ProofData[];
  title: string;
  total?: number;
  iconSize?: number;
  // Controlled mode — when provided, the trigger button is not rendered
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
};

type PlayerStats = {
  playerName: string;
  count: number;
  lastContribution: Date;
};

export function PlayerBreakdownDialog({
  proofs,
  title,
  total,
  iconSize = 6,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isLoading,
}: PlayerBreakdownDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [page, setPage] = useState(0);

  const playerBreakdown = useMemo(() => {
    const breakdown = new Map<string, PlayerStats>();

    for (const proof of proofs) {
      const name = proof.playerName || "Unknown";
      const existing = breakdown.get(name);
      const proofDate = new Date(proof.created_at);

      if (existing) {
        existing.count += proof.quantity;
        if (proofDate > existing.lastContribution) {
          existing.lastContribution = proofDate;
        }
      } else {
        breakdown.set(name, {
          playerName: name,
          count: proof.quantity,
          lastContribution: proofDate,
        });
      }
    }

    return Array.from(breakdown.values()).sort((a, b) => b.count - a.count);
  }, [proofs]);

  const totalCount = useMemo(
    () => playerBreakdown.reduce((sum, p) => sum + p.count, 0),
    [playerBreakdown],
  );

  const totalPages = Math.ceil(playerBreakdown.length / PAGE_SIZE);
  const paginatedBreakdown = playerBreakdown.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );

  if (proofs.length === 0 && !isLoading && !isControlled) return null;

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog
      open={isControlled ? controlledOpen : undefined}
      onOpenChange={(open) => {
        if (!open) setPage(0);
        controlledOnOpenChange?.(open);
      }}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Eye className={`size-${iconSize}`} />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base text-muted-foreground text-left">
                    Player
                  </TableHead>
                  <TableHead className="text-base text-muted-foreground text-right pr-8">
                    Count
                  </TableHead>
                  <TableHead className="text-base text-muted-foreground text-left">
                    Last
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBreakdown.map((player) => (
                  <TableRow key={player.playerName}>
                    <TableCell className="text-lg font-bold">
                      <div className="flex items-center gap-2">
                        {player.playerName}
                      </div>
                    </TableCell>
                    <TableCell className="text-lg tabular-nums text-right pr-8">
                      {player.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-base">
                      {formatDate(player.lastContribution)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="text-base font-bold">Total</TableCell>
                  <TableCell className="text-base font-bold tabular-nums text-right pr-6">
                    {totalCount.toLocaleString()}
                    {total && ` / ${total.toLocaleString()}`}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => { e.preventDefault(); setPage((p) => p - 1); }}
                      className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm text-muted-foreground px-2">
                      {page + 1} / {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => { e.preventDefault(); setPage((p) => p + 1); }}
                      className={page === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
