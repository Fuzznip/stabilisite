"use client";

import Image from "next/image";
import { CollectionLogItemEntry, CollectionLogSummary } from "@/lib/types";
import { cn, collectionLogItemImage } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ItemGrid({
  items,
  summary,
  onSelect,
}: {
  items: CollectionLogItemEntry[];
  summary: CollectionLogSummary;
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
        const memberCount = summary[item.itemId]?.memberCount ?? 0;
        const obtained = memberCount > 0;
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
                  src={collectionLogItemImage(item.itemId)}
                  alt={item.name}
                  width={36}
                  height={32}
                  unoptimized
                  className={cn(
                    "block w-[calc(36*var(--cl-px))] h-[calc(32*var(--cl-px))]",
                    // The client draws items nobody has as dark silhouettes.
                    !obtained && "brightness-[0.25]",
                  )}
                />
                {obtained && (
                  <span
                    className={cn(
                      "absolute top-0 left-0 pointer-events-none",
                      "text-[var(--cl-yellow)] leading-[calc(12*var(--cl-px))]",
                    )}
                  >
                    {memberCount}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent
              showArrow={false}
              className="font-osrs bg-[#0f0e0c] border-[#5a4f3a] text-[#ff9040]"
            >
              <span className="text-lg">{item.name}</span>
              {obtained && (
                <span className="text-[#f4f4f4] text-base">
                  {` — ${memberCount} member${memberCount === 1 ? "" : "s"}`}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
