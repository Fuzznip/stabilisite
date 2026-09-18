"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { OsrsPanel, PANEL_RULE } from "@/components/collection-log/OsrsPanel";
import type { ClogActivityEntry } from "@/lib/types/v2";
import { cn, collectionLogItemImage } from "@/lib/utils";
import { CLOG_REFETCH_MS } from "./ClogBoard";
import { ClogProofDialog } from "./ClogProofDialog";

const PER_PAGE = 10;

/** Pager buttons reuse the search field's sunken bevel rather than a sprite. */
const PAGER_BUTTON = cn(
  "px-[calc(6*var(--cl-px))] py-[calc(2*var(--cl-px))] cursor-pointer",
  "border-solid border-[length:var(--cl-px)]",
  "border-t-[var(--cl-bevel-light)] border-l-[var(--cl-bevel-light)]",
  "border-b-[var(--cl-bevel-dark)] border-r-[var(--cl-bevel-dark)]",
  "text-[var(--cl-tan)] hover:text-[var(--cl-orange-hover)]",
  "active:border-t-[var(--cl-bevel-dark)] active:border-l-[var(--cl-bevel-dark)]",
  "active:border-b-[var(--cl-bevel-light)] active:border-r-[var(--cl-bevel-light)]",
  "disabled:cursor-default disabled:opacity-40 disabled:text-[var(--cl-tan)]",
  "focus-visible:[outline:var(--cl-px)_solid_var(--cl-white)]",
);

type Feed = {
  items: ClogActivityEntry[];
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
};

const EMPTY: Feed = {
  items: [],
  page: 1,
  pages: 1,
  has_next: false,
  has_prev: false,
};

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDistanceToNow(date)} ago`;
}

export function ClogActivity({
  eventId,
  teamId,
  teamName,
}: {
  eventId: string;
  /** Scopes the feed to one team; null shows the whole event. */
  teamId: string | null;
  teamName?: string;
}): React.ReactElement {
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<ClogActivityEntry | null>(null);

  // Changing team must go back to page 1 — page 3 of the whole event is often
  // past the end of one team's feed. The caller remounts this on team change
  // (key={teamId}), which resets `page` without a setState-in-effect.
  const { data = EMPTY, isFetching } = useQuery({
    queryKey: ["clog-recent", eventId, teamId, page],
    queryFn: async (): Promise<Feed> => {
      const query = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      });
      if (teamId) query.set("team_id", teamId);
      const res = await fetch(`/api/clog/${eventId}/recent?${query}`);
      if (!res.ok) return EMPTY;
      return (await res.json()) as Feed;
    },
    // Keep the previous page on screen while the next one loads, so the panel
    // does not collapse to empty and jump the page around between clicks.
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    refetchInterval: CLOG_REFETCH_MS,
  });

  const totalPages = Math.max(1, data.pages);

  return (
    <OsrsPanel>
      <h2
        className={cn(
          "shrink-0 font-bold text-center",
          "h-[calc(28*var(--cl-px))] leading-[calc(28*var(--cl-px))]",
          "px-[calc(4*var(--cl-px))]",
        )}
      >
        {teamName ? `Recent Activity — ${teamName}` : "Recent Activity"}
      </h2>

      <span aria-hidden className={PANEL_RULE} />

      <div className={cn("flex-1", isFetching && "opacity-60")}>
        {data.items.length ? (
          <ul className="flex flex-col">
            {data.items.map((entry) => (
              // The row button and the profile link are siblings, not nested —
              // an anchor inside a button is invalid and unreachable by
              // keyboard. The button covers the row; the link sits above it.
              <li
                key={entry.id}
                className={cn(
                  "relative flex items-center gap-[calc(8*var(--cl-px))]",
                  "px-[calc(8*var(--cl-px))] py-[calc(2*var(--cl-px))]",
                  // Same step down from the panel default as the boss/raid list.
                  "text-[length:calc(13px*var(--cl-scale))]",
                  "hover:bg-black/20",
                )}
              >
                <button
                  type="button"
                  onClick={() => setViewing(entry)}
                  aria-label={`View ${entry.player_name}'s ${entry.item_name} screenshot`}
                  className={cn(
                    "absolute inset-0 cursor-pointer",
                    "focus-visible:[outline:var(--cl-px)_solid_var(--cl-white)]",
                  )}
                />
                <Image
                  src={collectionLogItemImage(entry.item_id)}
                  alt={entry.item_name}
                  width={36}
                  height={32}
                  unoptimized
                  className="shrink-0 w-[calc(36*var(--cl-px))] h-[calc(32*var(--cl-px))]"
                />
                <p className="min-w-0 flex-1 truncate">
                  <Link
                    href={`/profile/${entry.player_name}`}
                    className="relative text-[var(--cl-green)] hover:text-[var(--cl-orange-hover)]"
                  >
                    {entry.player_name}
                  </Link>
                  <span className="text-[var(--cl-white)]"> received </span>
                  <span className="text-[var(--cl-yellow)]">
                    {entry.item_name}
                  </span>
                  <span className="text-[var(--cl-white)]"> for </span>
                  <span style={{ color: entry.team_color ?? undefined }}>
                    {entry.team_name}
                  </span>
                </p>
                <span className="shrink-0 text-[var(--cl-tan)]">
                  {relativeTime(entry.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className={cn(
              "text-[var(--cl-white)]",
              "px-[calc(8*var(--cl-px))] py-[calc(10*var(--cl-px))]",
            )}
          >
            {teamName
              ? `${teamName} has not claimed any slots yet.`
              : "No slots have been claimed yet."}
          </p>
        )}
      </div>

      <span aria-hidden className={PANEL_RULE} />

      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          "gap-[calc(10*var(--cl-px))] h-[calc(26*var(--cl-px))]",
        )}
      >
        <button
          type="button"
          className={PAGER_BUTTON}
          disabled={!data.has_prev || isFetching}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span className="text-[var(--cl-white)] mx-4">
          Page {data.page} / {totalPages}
        </span>
        <button
          type="button"
          className={PAGER_BUTTON}
          disabled={!data.has_next || isFetching}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      <ClogProofDialog
        targets={
          viewing
            ? [
                {
                  statusId: viewing.status_id,
                  teamName: viewing.team_name,
                  teamColor: viewing.team_color,
                },
              ]
            : []
        }
        itemName={viewing?.item_name ?? null}
        page={viewing?.page}
        onClose={() => setViewing(null)}
      />
    </OsrsPanel>
  );
}
