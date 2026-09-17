"use client";

import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CollectionLog,
  type ObtainedEntry,
  type ObtainedMap,
} from "@/components/collection-log/CollectionLog";
import type { CollectionLogCategory } from "@/lib/types";
import type { ClogProgress, ClogSlot } from "@/lib/types/v2";
import { cn } from "@/lib/utils";
import { ClogProofDialog } from "./ClogProofDialog";

// One client per page module, as every other event page here does — a client
// created inside the component would be rebuilt on every render.
const queryClient = new QueryClient();

/** Slots arrive flat; the log renders tab → page → items. */
function toCategories(slots: ClogSlot[]): CollectionLogCategory[] {
  const tabs = new Map<string, Map<string, ClogSlot[]>>();
  for (const slot of slots) {
    const pages = tabs.get(slot.category) ?? new Map<string, ClogSlot[]>();
    const items = pages.get(slot.page) ?? [];
    items.push(slot);
    pages.set(slot.page, items);
    tabs.set(slot.category, pages);
  }

  return [...tabs.entries()].map(([category, pages]) => ({
    category,
    pages: [...pages.entries()]
      .sort((a, b) => (a[1][0]?.page_order ?? 0) - (b[1][0]?.page_order ?? 0))
      .map(([page, items]) => ({
        page,
        items: items
          .sort((a, b) => a.sequence - b.sequence)
          .map((slot) => ({ itemId: slot.item_id, name: slot.name })),
      })),
  }));
}

export function ClogBoard({
  slots,
  progress,
}: {
  slots: ClogSlot[];
  progress: ClogProgress;
}): React.ReactElement {
  const [teamId, setTeamId] = useState(progress.standings[0]?.team_id ?? "");
  const [proof, setProof] = useState<{ statusId: string; itemName: string } | null>(
    null,
  );

  const categories = useMemo(() => toCategories(slots), [slots]);

  const obtained = useMemo(() => {
    const map: ObtainedMap = {};
    for (const [itemId, entry] of Object.entries(
      progress.completed[teamId] ?? {},
    )) {
      const value: ObtainedEntry = {
        statusId: entry.status_id,
        points: entry.points,
      };
      map[Number(itemId)] = value;
    }
    return map;
  }, [progress, teamId]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {progress.standings.map((team) => (
            <button
              key={team.team_id}
              type="button"
              onClick={() => setTeamId(team.team_id)}
              aria-pressed={team.team_id === teamId}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm transition-colors cursor-pointer",
                team.team_id === teamId
                  ? "border-foreground/40 bg-muted text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              style={
                team.team_id === teamId && team.color
                  ? { borderColor: team.color }
                  : undefined
              }
            >
              {team.name}
              <span className="ml-2 text-muted-foreground">
                {team.slots_completed}
              </span>
            </button>
          ))}
        </div>

        <CollectionLog
          categories={categories}
          obtained={obtained}
          title="Collection Log Race"
          onSelectItem={(item) => {
            const entry = obtained[item.itemId];
            setProof(
              entry ? { statusId: entry.statusId, itemName: item.name } : null,
            );
          }}
        />

        <ClogProofDialog
          statusId={proof?.statusId ?? null}
          itemName={proof?.itemName ?? null}
          onClose={() => setProof(null)}
        />
      </div>
    </QueryClientProvider>
  );
}
