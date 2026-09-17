"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ImageOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BotwProof } from "@/lib/types/v2";

async function fetchProofs(statusId: string): Promise<BotwProof[]> {
  const res = await fetch(`/api/botw/statuses/${statusId}/proofs`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export function ClogProofDialog({
  statusId,
  itemName,
  onClose,
}: {
  statusId: string | null;
  itemName: string | null;
  onClose: () => void;
}): React.ReactElement {
  const { data, isPending } = useQuery({
    queryKey: ["clog-proofs", statusId],
    queryFn: () => fetchProofs(statusId as string),
    enabled: Boolean(statusId),
    staleTime: 30_000,
  });

  // A team completes a slot once, so there is one proof. Take the newest
  // anyway rather than assuming index 0 is ordered.
  const proof = [...(data ?? [])]
    .filter((p): p is BotwProof & { img_path: string } => Boolean(p.img_path))
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0];

  return (
    <Dialog open={Boolean(statusId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[70vw] p-0 overflow-hidden gap-0 flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-foreground/10 shrink-0">
          <DialogTitle className="text-2xl font-bold tracking-tight pr-8">
            {itemName ?? "Slot"}
          </DialogTitle>
          {proof && (
            <span className="flex items-center gap-2 text-base text-muted-foreground mt-1">
              <Calendar className="size-4" />
              {new Date(proof.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
        </DialogHeader>

        {isPending ? (
          <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
            Loading…
          </div>
        ) : !proof ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ImageOff className="size-10" />
            <p className="text-lg">No screenshot for this slot.</p>
          </div>
        ) : (
          <div className="relative w-full min-h-[50vh] bg-black/20">
            <Image
              src={proof.img_path}
              alt={itemName ?? ""}
              fill
              sizes="70vw"
              unoptimized
              className="object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
