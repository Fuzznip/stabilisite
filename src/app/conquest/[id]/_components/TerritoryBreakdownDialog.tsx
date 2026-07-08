"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TerritoryProofDialog } from "./TerritoryProofDialog";
import type {
  TerritoryProgressEntry,
  TerritoryProofEntry,
} from "@/lib/types/v2";

async function fetchProofs(
  territoryId: string,
  teamId: string,
): Promise<TerritoryProofEntry[]> {
  const res = await fetch(
    `/api/conquest/territories/${territoryId}/proofs?team_id=${teamId}`,
  );
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
}

type TriggerSlot = {
  name: string;
  imgPath: string | null;
  required: number | null;
  qty: number;
  triggerType: string | null;
  value: number;
  source: string | null;
};

type SlotGroup = {
  /** Source name used as group header in Type 3 challenges (e.g. boss name) */
  label: string | null;
  slots: TriggerSlot[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildLeafSlot(
  c: any,
  proofs: TerritoryProofEntry[],
): TriggerSlot | null {
  if (!c.trigger) return null;
  const name = c.trigger.name as string;
  const triggerType = (c.trigger.type as string | null) ?? null;
  // Each proof action records the quantity for that event (delta, not cumulative)
  const matching = proofs.filter((p) => p.action?.name === name);
  const qty = matching.reduce((sum, p) => sum + (p.action?.quantity ?? 0), 0);
  return {
    name,
    imgPath: c.trigger.img_path ?? null,
    required: c.quantity ?? null,
    qty,
    triggerType,
    value: c.value ?? 1,
    source: c.trigger.source ?? null,
  };
}

// Recursively collect all leaf slots from a subtree
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectLeaves(
  node: any,
  proofs: TerritoryProofEntry[],
): TriggerSlot[] {
  if (node.trigger) {
    const slot = buildLeafSlot(node, proofs);
    return slot ? [slot] : [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (node.children?.length)
    return (node.children as any[]).flatMap((c) => collectLeaves(c, proofs));
  return [];
}

function buildGroups(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  challenge: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger: any | null,
  teamProgress: TerritoryProgressEntry | undefined,
  proofs: TerritoryProofEntry[],
): SlotGroup[] {
  // Type 1 — single leaf: the root challenge IS the leaf
  if (challenge.trigger_id) {
    const resolvedTrigger = challenge.trigger ?? trigger;
    return [
      {
        label: null,
        slots: [
          {
            name: resolvedTrigger?.name ?? "Unknown",
            imgPath: resolvedTrigger?.img_path ?? null,
            required: challenge.quantity ?? null,
            qty: teamProgress?.quantity ?? 0,
            triggerType: resolvedTrigger?.type ?? null,
            value: challenge.value ?? 1,
            source: resolvedTrigger?.source ?? null,
          },
        ],
      },
    ];
  }

  if (!challenge.children?.length) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children = challenge.children as any[];

  // Type 3 — grouped: children have no trigger but have their own children (pure grouping level)
  const isGroupLevel = children.some(
    (c) => !c.trigger && c.children?.length > 0,
  );

  if (isGroupLevel) {
    // Each child is a group; leaves are the grandchildren
    return children
      .filter((c) => c.children?.length > 0 || c.trigger)
      .map((group) => {
        const leaves = collectLeaves(group, proofs);
        // Use the shared source of the first leaf as the group label (e.g. "Bandos")
        const label = leaves[0]?.source ?? null;
        return { label, slots: leaves };
      })
      .filter((g) => g.slots.length > 0);
  }

  // Type 2 / Type 4 — flat leaves (direct children are all leaves)
  return [
    {
      label: null,
      slots: children.flatMap((c) => collectLeaves(c, proofs)),
    },
  ];
}

interface TerritoryBreakdownDialogProps {
  territoryId: string;
  teamId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  challenge: any | null;
  // fallback trigger when not embedded in challenge (separately fetched)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger?: any | null;
  teamProgress: TerritoryProgressEntry | undefined;
  children: React.ReactNode;
}

export function TerritoryBreakdownDialog({
  territoryId,
  teamId,
  challenge,
  trigger,
  teamProgress,
  children,
}: TerritoryBreakdownDialogProps) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TriggerSlot | null>(null);
  const [proofOpen, setProofOpen] = useState(false);

  const { data: proofs = [] } = useQuery<TerritoryProofEntry[]>({
    queryKey: ["territory-proofs", territoryId, teamId],
    queryFn: () => fetchProofs(territoryId, teamId),
    enabled,
    staleTime: 30_000,
  });

  // Re-open proof dialog after breakdown dialog closes (avoids nested dialog issues)
  useEffect(() => {
    if (!open && selectedSlot) {
      const t = setTimeout(() => setProofOpen(true), 100);
      return () => clearTimeout(t);
    }
  }, [open, selectedSlot]);

  if (!challenge) return <>{children}</>;

  const isOrChallenge = !challenge.trigger_id && challenge.children?.length > 0;
  const groups = buildGroups(challenge, trigger, teamProgress, proofs);
  const hasMultipleGroups = groups.length > 1;
  // When any leaf has val > 1 the territory uses point-weighted scoring
  const isPointWeighted = groups.some((g) => g.slots.some((s) => s.value > 1));

  function handleSlotClick(slot: TriggerSlot) {
    setSelectedSlot(slot);
    setOpen(false);
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (v) {
            setEnabled(true);
            setSelectedSlot(null);
          }
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
          <DialogHeader className="gap-1 px-6 pt-6 pb-4 border-b border-foreground/10">
            <DialogTitle className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">
              Progress Breakdown
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground/60">
              Select a trigger to view its proof
            </DialogDescription>
          </DialogHeader>

          <div className="py-1 max-h-[80vh] overflow-y-auto">
            {groups.map((group, gi) => (
              <div key={gi}>
                {/* Group header for Type 3 challenges */}
                {hasMultipleGroups && (
                  <div
                    className="px-6 pt-4 pb-1 text-base font-mono uppercase tracking-widest text-muted-foreground/40"
                    style={
                      gi > 0
                        ? {
                            borderTop: "1px solid rgba(255,255,255,0.04)",
                            marginTop: "4px",
                          }
                        : undefined
                    }
                  >
                    {group.label ?? `Group ${gi + 1}`}
                  </div>
                )}

                {group.slots.map((slot, si) => {
                  const hasSlotProgress = slot.qty > 0;
                  const label =
                    slot.required == null
                      ? `${slot.qty}×`
                      : slot.required === 1
                        ? `${slot.qty}`
                        : `${slot.qty} / ${slot.required}`;
                  return (
                    <button
                      key={si}
                      onClick={() => handleSlotClick(slot)}
                      className="w-full flex items-center gap-3.5 px-6 py-2.5 hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                    >
                      {slot.imgPath ? (
                        <div
                          className="relative size-11 shrink-0 rounded overflow-hidden"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.10)",
                          }}
                        >
                          <Image
                            src={slot.imgPath}
                            alt={slot.name}
                            fill
                            unoptimized
                            className="object-contain p-0.5"
                          />
                          {isPointWeighted && (
                            <div className="absolute -top-1.5 -left-1.5 size-6 rounded-full flex items-center justify-center bg-stability text-white text-xs font-bold shadow-md z-10">
                              {slot.value}
                            </div>
                          )}
                          {slot.required != null && slot.required > 1 && (
                            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-stability/10 border-t border-stability text-white text-xs font-bold py-0.5 leading-none z-10">
                              req: {slot.required}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="size-11 shrink-0 rounded bg-white/[0.06] border border-white/10" />
                      )}
                      <span className="flex-1 text-lg font-medium text-foreground/80 truncate min-w-0">
                        {slot.name}
                      </span>
                      <span
                        className="text-lg font-mono tabular-nums shrink-0"
                        style={{
                          color: hasSlotProgress
                            ? "rgba(255,255,255,0.9)"
                            : "rgba(255,255,255,0.25)",
                        }}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {selectedSlot && (
        <TerritoryProofDialog
          territoryId={territoryId}
          teamId={teamId}
          triggerName={selectedSlot.name}
          requiredQuantity={selectedSlot.required}
          filterByActionName={isOrChallenge ? selectedSlot.name : undefined}
          open={proofOpen}
          onOpenChange={(v) => {
            setProofOpen(v);
            if (!v) setSelectedSlot(null);
          }}
        />
      )}
    </>
  );
}
