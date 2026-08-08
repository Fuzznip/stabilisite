"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Images, Loader2 } from "lucide-react";
import { CollectionLogItemEntry, CollectionLogMember } from "@/lib/types";
import { cn, collectionLogItemImage, formatDate } from "@/lib/utils";
import { DropGallery } from "./DropGallery";

export function ItemMembersDialog({
  item,
  members,
  loading,
  onOpenChange,
}: {
  item: CollectionLogItemEntry | null;
  members: CollectionLogMember[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactElement {
  const [gallery, setGallery] = useState<CollectionLogMember | null>(null);

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {item && (
              <Image
                src={collectionLogItemImage(item.itemId)}
                alt={item.name}
                width={36}
                height={32}
                unoptimized
                className="shrink-0 [image-rendering:pixelated]"
              />
            )}
            <span className="capitalize">{item?.name}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-stability" />
          </div>
        ) : members.length ? (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Member</TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Received
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    First
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.discordId}>
                    <TableCell className="capitalize">
                      {member.runescapeName}
                    </TableCell>
                    <TableCell className="text-right tabular-nums p-0">
                      {/* The count opens that member's screenshots for this
                          item. Drops without one are still listed, so the
                          gallery length always matches the count. */}
                      <button
                        type="button"
                        disabled={!member.drops.length}
                        onClick={() => setGallery(member)}
                        aria-label={`View ${member.runescapeName}'s ${member.count} drops`}
                        className={cn(
                          "w-full h-full px-4 py-2 inline-flex items-center justify-end gap-1.5",
                          member.drops.length
                            ? "cursor-pointer hover:text-stability"
                            : "cursor-default"
                        )}
                      >
                        {member.count}
                        {member.drops.length > 0 && (
                          <Images className="size-3.5 opacity-60" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {member.firstObtained
                        ? formatDate(new Date(member.firstObtained))
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">
            No clan members have obtained this yet.
          </p>
        )}
      </DialogContent>

      {item && (
        <DropGallery
          key={gallery?.discordId ?? "none"}
          open={!!gallery}
          onOpenChange={(open) => !open && setGallery(null)}
          itemId={item.itemId}
          itemName={item.name}
          playerName={gallery?.runescapeName}
          drops={gallery?.drops ?? []}
        />
      )}
    </Dialog>
  );
}
