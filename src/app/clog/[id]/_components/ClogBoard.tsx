"use client";

import { useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
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
import {
  OSRS_TOKENS,
  PANEL_MAX_WIDTH,
} from "@/components/collection-log/OsrsPanel";
import type { CollectionLogCategory, CollectionLogItemEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ClogProgress, ClogSlot, ClogSlotPlacement } from "@/lib/types/v2";
import { ClogActivity } from "./ClogActivity";
import { ClogProofDialog, type ClogProofTarget } from "./ClogProofDialog";
import { ClogTeamDetail } from "./ClogTeamDetail";

// One client per page module, as every other event page here does — a client
// created inside the component would be rebuilt on every render.
const queryClient = new QueryClient();

/** How often the board, roster and feed re-poll. */
export const CLOG_REFETCH_MS = 60_000;

async function fetchProgress(eventId: string): Promise<ClogProgress> {
  const res = await fetch(`/api/clog/${eventId}/progress`);
  if (!res.ok) throw new Error("Failed to fetch clog progress");
  return (await res.json()) as ClogProgress;
}

/** Where a slot is drawn. Older API responses only carry the single home page. */
function placementsOf(slot: ClogSlot): ClogSlotPlacement[] {
  if (slot.placements?.length) return slot.placements;
  const { category, page, page_order, sequence } = slot;
  return [{ category, page, page_order, sequence }];
}

/** Slots arrive flat; the log renders tab → page → items.
 *
 *  A slot can land on several pages: an item the game lists under more than one
 *  boss (Awakener's orb at every DT2 boss, Dragon pickaxe across the wilderness)
 *  is scored once but shown everywhere it appears, so a page only goes green
 *  when the team really has everything on it. Nothing downstream double-counts,
 *  because `obtained`, `teamMarks` and the log's own header all key on item id.
 */
function toCategories(slots: ClogSlot[]): CollectionLogCategory[] {
  type Entry = { sequence: number; item: CollectionLogItemEntry };
  type Page = { page_order: number; entries: Entry[] };
  const tabs = new Map<string, Map<string, Page>>();

  for (const slot of slots) {
    const item: CollectionLogItemEntry = {
      itemId: slot.item_id,
      name: slot.name,
      points: slot.points,
    };
    for (const at of placementsOf(slot)) {
      const pages = tabs.get(at.category) ?? new Map<string, Page>();
      // page_order comes off the placement, not the slot: a mirrored item sorts
      // by where it is being drawn, not by where it is scored.
      const pg = pages.get(at.page) ?? { page_order: at.page_order, entries: [] };
      pg.entries.push({ sequence: at.sequence, item });
      pages.set(at.page, pg);
      tabs.set(at.category, pages);
    }
  }

  return [...tabs.entries()].map(([category, pages]) => ({
    category,
    pages: [...pages.entries()]
      .sort((a, b) => a[1].page_order - b[1].page_order)
      .map(([page, { entries }]) => ({
        page,
        items: entries
          .sort((a, b) => a.sequence - b.sequence)
          .map((entry) => entry.item),
      })),
  }));
}

export function ClogBoard(props: {
  eventId: string;
  slots: ClogSlot[];
  progress: ClogProgress;
}): React.ReactElement {
  // useQuery needs the provider above it, so the provider cannot live inside
  // the component that polls.
  return (
    <QueryClientProvider client={queryClient}>
      <ClogBoardInner {...props} />
    </QueryClientProvider>
  );
}

function ClogBoardInner({
  eventId,
  slots,
  progress: initialProgress,
}: {
  eventId: string;
  slots: ClogSlot[];
  progress: ClogProgress;
}): React.ReactElement {
  // Seeded from the server render, then re-polled so a drop landing mid-session
  // shows up without a reload. Slots are not polled: they only change when an
  // admin prunes one, which a refresh picks up.
  const { data: progress = initialProgress } = useQuery({
    queryKey: ["clog-progress", eventId],
    queryFn: () => fetchProgress(eventId),
    initialData: initialProgress,
    refetchInterval: CLOG_REFETCH_MS,
  });

  // Null means "all teams", which is the default: a race is best read as one
  // board showing who holds what, not as three boards you flip between.
  // Selecting a team narrows the lighting to that team; the pips keep showing
  // everyone either way, so the comparison never disappears.
  const [teamId, setTeamId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [proof, setProof] = useState<{
    targets: ClogProofTarget[];
    itemName: string;
    page?: string;
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

  const slotByItemId = useMemo(() => {
    const map = new Map<number, ClogSlot>();
    for (const slot of slots) map.set(slot.item_id, slot);
    return map;
  }, [slots]);

  const selectedTeam = teams.find((t) => t.id === teamId) ?? null;
  // CollectionLog appends " - obtained/total" itself, and `obtained` already
  // means "anyone has it" when no team is picked, so the count is right either
  // way without special-casing here.
  const logTitle = selectedTeam ? selectedTeam.name : "Collection Log Race";

  return (
    <>
      <div className="flex flex-col gap-6">
      {/* Side by side once there is room. The log panel is `max-w` and its item
          grid is auto-fill, so it reflows into the narrower column rather than
          overflowing; below lg the two stack. The sidebar is 22rem, which
          fits a 56px logo, a text-2xl name and the points on one row.

          The row carries the panel cap itself so log + sidebar together end
          where the activity panel below does — capping only the log would let
          the sidebar push the row wider than everything under it. OSRS_TOKENS
          comes along because --cl-px, which the cap is written in, is defined
          by the panels rather than the page. */}
      <div
        className={cn(
          "flex w-full mx-auto flex-col gap-6 lg:flex-row lg:items-start lg:gap-6",
          OSRS_TOKENS,
          PANEL_MAX_WIDTH,
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <CollectionLog
            categories={categories}
            obtained={obtained}
            teamMarks={teamId ? undefined : teamMarks}
            title={logTitle}
            onSelectItem={(item) => {
              // In the all-teams view every claimant contributes a slide, so
              // the gallery shows the whole race for that slot. Filtered to a
              // team, it shows only theirs.
              const targets: ClogProofTarget[] = progress.standings
                .filter((t) => !teamId || t.team_id === teamId)
                .flatMap((t) => {
                  const entry =
                    progress.completed[t.team_id]?.[String(item.itemId)];
                  return entry
                    ? [
                        {
                          statusId: entry.status_id,
                          teamName: t.name,
                          teamColor: t.color,
                        },
                      ]
                    : [];
                });
              setProof(
                targets.length
                  ? {
                      targets,
                      itemName: item.name,
                      page: slotByItemId.get(item.itemId)?.page,
                    }
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
          targets={proof?.targets ?? []}
          itemName={proof?.itemName ?? null}
          page={proof?.page}
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
    </>
  );
}
