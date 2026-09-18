"use client";

import Image from "next/image";
import { CollectionLogItemEntry } from "@/lib/types";
import { cn, collectionLogItemImage } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ObtainedMap, TeamMarkMap } from "./CollectionLog";

export function ItemGrid({
  items,
  obtained,
  teamMarks,
  onSelect,
}: {
  items: CollectionLogItemEntry[];
  obtained: ObtainedMap;
  /** Who else has each slot, drawn as pips. Independent of `obtained`, so a
   *  slot another team holds still shows its pip while sitting dark for yours —
   *  which is the "they have it, we don't" read. */
  teamMarks?: TeamMarkMap;
  onSelect: (item: CollectionLogItemEntry) => void;
}): React.ReactElement {
  return (
    <div
      className={cn(
        "grid justify-items-center",
        "grid-cols-[repeat(auto-fill,minmax(calc(47*var(--cl-px)),1fr))]",
        "px-[calc(6*var(--cl-px))] pt-[calc(6*var(--cl-px))] pb-[calc(10*var(--cl-px))]",
      )}
    >
      {items.map((item) => {
        const isObtained = obtained[item.itemId] !== undefined;
        const marks = teamMarks?.[item.itemId] ?? [];
        const src = collectionLogItemImage(item.itemId);
        return (
          <Tooltip key={item.itemId}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  "relative cursor-pointer",
                  "w-[calc(36*var(--cl-px))] h-[calc(40*var(--cl-px))]",
                  "focus-visible:[outline:var(--cl-px)_solid_var(--cl-white)]",
                )}
              >
                <Image
                  src={src}
                  alt={item.name}
                  width={36}
                  height={32}
                  unoptimized
                  className={cn(
                    "block w-[calc(36*var(--cl-px))] h-[calc(32*var(--cl-px))]",
                    // The client draws items nobody has as dark silhouettes.
                    !isObtained && "brightness-[0.25]",
                  )}
                />
                {(item.points ?? 0) > 1 && (
                  <span
                    className={cn(
                      "pointer-events-none absolute top-0 right-0",
                      "rounded-[calc(2*var(--cl-px))] bg-black/70",
                      "px-[calc(2*var(--cl-px))]",
                      "text-xs sm:text-sm leading-none text-[var(--cl-yellow)]",
                    )}
                  >
                    {item.points} pts
                  </span>
                )}
                {marks.length > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute bottom-[calc(7*var(--cl-px))] right-0",
                      "flex gap-[calc(1*var(--cl-px))]",
                    )}
                  >
                    {marks.map((team) => (
                      <span
                        key={team.id}
                        className="size-[calc(5*var(--cl-px))] rounded-full ring-1 ring-black/60"
                        style={{ background: team.color ?? "#9ca3af" }}
                      />
                    ))}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent
              showArrow={false}
              className="font-osrs bg-[#0f0e0c] border-[#5a4f3a] text-[#ff9040]"
            >
              <span className="text-lg">{item.name}</span>
              {item.points !== undefined && (
                <span className="text-[#f4f4f4] text-base">
                  {` — ${item.points} pt${item.points === 1 ? "" : "s"}`}
                </span>
              )}
              {/* Pips are coloured dots and nothing more, so the teams are
                  named here — otherwise two dots are unreadable. */}
              {marks.length > 0 && (
                <span className="block text-[#f4f4f4] text-base">
                  {marks.map((t) => t.name).join(", ")}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
