"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CollectionLogEvent } from "@/lib/types";
import { PaginatedResponse } from "@/lib/fetch/getSplits";
import { cn, collectionLogItemImage } from "@/lib/utils";
import { OsrsPanel, PANEL_RULE } from "./OsrsPanel";
import { getRecentPage } from "../_actions/getRecentPage";

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
  "focus-visible:[outline:var(--cl-px)_solid_var(--cl-white)]"
);

function relativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDistanceToNow(date)} ago`;
}

export function RecentCollections({
  initial,
}: {
  initial: PaginatedResponse<CollectionLogEvent>;
}): React.ReactElement {
  const [data, setData] = useState(initial);
  const [pending, startTransition] = useTransition();

  const goTo = (page: number) => {
    startTransition(async () => {
      setData(await getRecentPage(page));
    });
  };

  const totalPages = Math.max(1, data.pages);

  return (
    <OsrsPanel>
      <h2
        className={cn(
          "shrink-0 font-bold text-center",
          "h-[calc(28*var(--cl-px))] leading-[calc(28*var(--cl-px))]",
          "px-[calc(4*var(--cl-px))]"
        )}
      >
        Recent Collections
      </h2>

      <span aria-hidden className={PANEL_RULE} />

      {/* A full page is sized to fit, so this never needs to scroll — RECENT_PER_PAGE
          rows always render in full. */}
      <div className={cn("flex-1", pending && "opacity-60")}>
        {data.items.length ? (
          <ul className="flex flex-col">
            {data.items.map((event) => (
              <li
                key={event.id}
                className={cn(
                  "flex items-center gap-[calc(8*var(--cl-px))]",
                  "px-[calc(8*var(--cl-px))] py-[calc(2*var(--cl-px))]"
                )}
              >
                <Image
                  src={collectionLogItemImage(event.itemId)}
                  alt={event.itemName}
                  width={36}
                  height={32}
                  unoptimized
                  className="shrink-0 w-[calc(36*var(--cl-px))] h-[calc(32*var(--cl-px))]"
                />
                <p className="min-w-0 flex-1 truncate">
                  <Link
                    href={`/profile/${event.runescapeName}`}
                    className="text-[var(--cl-green)] hover:text-[var(--cl-orange-hover)]"
                  >
                    {event.runescapeName}
                  </Link>
                  <span className="text-[var(--cl-white)]"> received </span>
                  <span className="text-[var(--cl-yellow)]">
                    {event.itemName}
                  </span>
                </p>
                <span className="shrink-0 text-[var(--cl-tan)]">
                  {relativeTime(event.obtainedAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className={cn(
              "text-[var(--cl-white)]",
              "px-[calc(8*var(--cl-px))] py-[calc(10*var(--cl-px))]"
            )}
          >
            No collection log items have been recorded yet.
          </p>
        )}
      </div>

      <span aria-hidden className={PANEL_RULE} />

      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          "gap-[calc(10*var(--cl-px))] h-[calc(26*var(--cl-px))]"
        )}
      >
        <button
          type="button"
          className={PAGER_BUTTON}
          disabled={!data.has_prev || pending}
          onClick={() => goTo(data.page - 1)}
        >
          Prev
        </button>
        <span className="text-[var(--cl-white)]">
          Page {data.page} / {totalPages}
        </span>
        <button
          type="button"
          className={PAGER_BUTTON}
          disabled={!data.has_next || pending}
          onClick={() => goTo(data.page + 1)}
        >
          Next
        </button>
      </div>
    </OsrsPanel>
  );
}
