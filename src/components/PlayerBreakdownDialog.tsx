"use client";

import { useMemo } from "react";
import { Eye } from "lucide-react";
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
}: PlayerBreakdownDialogProps) {
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

  if (proofs.length === 0) return null;

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className={`size-${iconSize}`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

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
            {playerBreakdown.map((player) => (
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
      </DialogContent>
    </Dialog>
  );
}
