"use client";

import { useQueries } from "@tanstack/react-query";
import {
  ProofGallery,
  type ProofSlide,
} from "@/components/proof-gallery/ProofGallery";
import type { BotwProof } from "@/lib/types/v2";

/** One team's claim on a slot, as the caller knows it. */
export type ClogProofTarget = {
  statusId: string;
  teamName: string;
  teamColor: string | null;
};

async function fetchProofs(statusId: string): Promise<BotwProof[]> {
  const res = await fetch(`/api/botw/statuses/${statusId}/proofs`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

/**
 * Every screenshot for one collection log slot, across whichever teams claimed
 * it — so the all-teams board opens a gallery rather than a single image.
 *
 * Reuses the generic `/api/botw/statuses/<id>/proofs` passthrough: a proof hangs
 * off a challenge status regardless of which event type created it.
 */
export function ClogProofDialog({
  targets,
  itemName,
  page,
  onClose,
}: {
  /** Empty closes the dialog. One entry per team holding the slot. */
  targets: ClogProofTarget[];
  itemName: string | null;
  page?: string | null;
  onClose: () => void;
}): React.ReactElement {
  const results = useQueries({
    queries: targets.map((target) => ({
      queryKey: ["clog-proofs", target.statusId],
      queryFn: () => fetchProofs(target.statusId),
      enabled: targets.length > 0,
      staleTime: 30_000,
    })),
  });

  const loading = targets.length > 0 && results.some((r) => r.isPending);

  // Grouped by team in the order the caller gave them (standings order), and
  // newest first within a team.
  const slides: ProofSlide[] = [];
  targets.forEach((target, i) => {
    const proofs = results[i]?.data ?? [];
    proofs
      .filter((p): p is BotwProof & { img_path: string } => Boolean(p.img_path))
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .forEach((proof) => {
        slides.push({
          src: proof.img_path,
          title: itemName ?? "",
          subtitle: page ?? undefined,
          teamName: target.teamName,
          teamColor: target.teamColor,
          timestamp: new Date(proof.created_at),
        });
      });
  });

  return (
    <ProofGallery
      open={targets.length > 0}
      onOpenChange={(open) => !open && onClose()}
      slides={slides}
      loading={loading}
      fallbackTitle={itemName ?? "Screenshots"}
      emptyMessage="No screenshot was captured for this slot."
    />
  );
}
