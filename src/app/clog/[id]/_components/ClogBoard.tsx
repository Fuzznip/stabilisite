"use client";

import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CollectionLog,
  type ObtainedEntry,
  type ObtainedMap,
  type TeamMark,
  type TeamMarkMap,
} from "@/components/collection-log/CollectionLog";
import {
  EventLeaderboard,
  type LeaderboardTeam,
} from "@/components/event-leaderboard/EventLeaderboard";
import type { CollectionLogCategory } from "@/lib/types";
import type { ClogProgress, ClogSlot } from "@/lib/types/v2";
import { ClogActivity } from "./ClogActivity";
import { ClogProofDialog } from "./ClogProofDialog";
import { ClogTeamDetail } from "./ClogTeamDetail";

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
          .map((slot) => ({
            itemId: slot.item_id,
            name: slot.name,
            points: slot.points,
          })),
      })),
  }));
}

export function ClogBoard({
  eventId,
  slots,
  progress,
}: {
  eventId: string;
  slots: ClogSlot[];
  progress: ClogProgress;
}): React.ReactElement {
  // Null means "all teams", which is the default: a race is best read as one
  // board showing who holds what, not as three boards you flip between.
  // Selecting a team narrows the lighting to that team; the pips keep showing
  // everyone either way, so the comparison never disappears.
  const [teamId, setTeamId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [proof, setProof] = useState<{
    statusId: string;
    itemName: string;
  } | null>(null);

  const categories = useMemo(() => toCategories(slots), [slots]);

  const teams: LeaderboardTeam[] = useMemo(
    () =>
      progress.standings.map((team) => ({
        id: team.team_id,
        name: team.name,
        points: team.points,
        color: team.color,
        imageUrl: team.image_url,
        subtitle: `${team.slots_completed} / ${slots.length} slots`,
      })),
    [progress.standings, slots.length],
  );

  // Who holds each slot, in standings order so the leading team's pip is first
  // and the dot order is stable from cell to cell.
  const teamMarks = useMemo(() => {
    const map: TeamMarkMap = {};
    for (const team of progress.standings) {
      const mark: TeamMark = {
        id: team.team_id,
        name: team.name,
        color: team.color,
      };
      for (const itemId of Object.keys(progress.completed[team.team_id] ?? {})) {
        (map[Number(itemId)] ??= []).push(mark);
      }
    }
    return map;
  }, [progress]);

  // What lights up: the selected team's slots, or anyone's when showing all.
  const obtained = useMemo(() => {
    const map: ObtainedMap = {};
    const teamIds = teamId
      ? [teamId]
      : progress.standings.map((t) => t.team_id);
    for (const id of teamIds) {
      for (const [itemId, entry] of Object.entries(
        progress.completed[id] ?? {},
      )) {
        const key = Number(itemId);
        // First writer wins, and standings order means that is the leading team
        // holding the slot — so clicking it opens their proof.
        if (map[key]) continue;
        const value: ObtainedEntry = {
          statusId: entry.status_id,
          points: entry.points,
        };
        map[key] = value;
      }
    }
    return map;
  }, [progress, teamId]);

  const completedItemIds = useMemo(
    () =>
      new Set(Object.keys(teamId ? (progress.completed[teamId] ?? {}) : {}).map(Number)),
    [progress, teamId],
  );

  const selectedTeam = teams.find((t) => t.id === teamId) ?? null;
  // CollectionLog appends " - obtained/total" itself, and `obtained` already
  // means "anyone has it" when no team is picked, so the count is right either
  // way without special-casing here.
  const logTitle = selectedTeam ? selectedTeam.name : "Collection Log Race";

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col gap-6">
      {/* Side by side once there is room. The log panel is `max-w` and its item
          grid is auto-fill, so it reflows into the narrower column rather than
          overflowing; below lg the two stack. The sidebar is 22rem, which
          fits a 56px logo, a text-2xl name and the points on one row. */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <CollectionLog
            categories={categories}
            obtained={obtained}
            teamMarks={teamMarks}
            title={logTitle}
            onSelectItem={(item) => {
              const entry = obtained[item.itemId];
              setProof(
                entry
                  ? { statusId: entry.statusId, itemName: item.name }
                  : null,
              );
            }}
          />
        </div>

        {/* Sticky so the standings stay put while the log scrolls past. */}
        <div className="w-full shrink-0 lg:sticky lg:top-4 lg:w-[22rem]">
          <EventLeaderboard
            teams={teams}
            selectedTeamId={detailOpen ? teamId : null}
            activeTeamId={teamId}
            onSelectTeam={(id) => {
              // Clearing the selection goes back to the all-teams board, so
              // "deselected" and "showing everyone" are the same state rather
              // than two the reader has to keep straight.
              if (id === null) {
                setDetailOpen(false);
                setTeamId(null);
                return;
              }
              setTeamId(id);
              setDetailOpen(true);
            }}
            // The log panel is 300 * --cl-px tall, and --cl-scale is 2 from sm
            // up — so 600px, or 37.5rem, wherever the two sit side by side.
            // Matching it makes the two columns read as one block.
            bodyHeight="h-[30rem] lg:h-[37.5rem]"
            hint="Click a team to filter the log and see their roster"
            renderDetail={(team) => (
              <ClogTeamDetail
                eventId={eventId}
                team={team}
                slots={slots}
                completedItemIds={completedItemIds}
              />
            )}
          />
        </div>

        <ClogProofDialog
          statusId={proof?.statusId ?? null}
          itemName={proof?.itemName ?? null}
          onClose={() => setProof(null)}
        />
      </div>

      {/* Full width under both columns. Keyed on the team so switching one
          remounts the feed back to page 1 — page 3 of the whole event is
          usually past the end of a single team's history. */}
      <ClogActivity
        key={teamId ?? "all"}
        eventId={eventId}
        teamId={teamId}
        teamName={selectedTeam?.name}
      />
      </div>
    </QueryClientProvider>
  );
}
