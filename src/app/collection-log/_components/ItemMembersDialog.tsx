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
import { Loader2 } from "lucide-react";
import { CollectionLogItemEntry, CollectionLogMember } from "@/lib/types";
import { collectionLogItemImage, formatDate } from "@/lib/utils";
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
                {members.map((member) => {
                  const hasScreenshot = member.drops.some(
                    (drop) => !!drop.screenshot
                  );

                  return (
                    <TableRow key={member.discordId}>
                      <TableCell className="p-0">
                        {hasScreenshot ? (
                          <button
                            type="button"
                            onClick={() => setGallery(member)}
                            aria-label={`View ${member.runescapeName}'s screenshots`}
                            className="w-full h-full px-4 py-2 flex items-center capitalize cursor-pointer hover:text-stability"
                          >
                            {member.runescapeName}
                          </button>
                        ) : (
                          <span className="block px-4 py-2 capitalize">
                            {member.runescapeName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {member.count}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {member.firstObtained
                          ? formatDate(new Date(member.firstObtained))
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
