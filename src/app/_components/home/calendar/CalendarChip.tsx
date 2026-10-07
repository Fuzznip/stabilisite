"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  calendarAccent,
  calendarTint,
  calendarTypeLabel,
  formatItemWhen,
} from "@/lib/calendar/items";
import type { CalendarEntry, CalendarItem } from "@/lib/types/calendar";

/** One rule for what clicking an item does, shared by bars and agenda rows:
 *  staff edit their entries, everyone else follows the event link if released. */
export function CalendarItemAction({
  item,
  isAdmin,
  onSelectEntry,
  className,
  children,
}: {
  item: CalendarItem;
  isAdmin: boolean;
  onSelectEntry: (entry: CalendarEntry) => void;
  className?: string;
  children: React.ReactNode;
}): React.ReactElement {
  const label = `${item.name} — ${calendarTypeLabel(item.type)}, ${formatItemWhen(item)}`;
  if (isAdmin && item.entry) {
    const entry = item.entry;
    return (
      <button
        type="button"
        title={label}
        aria-label={`Edit ${label}`}
        onClick={() => onSelectEntry(entry)}
        className={cn("cursor-pointer text-left", className)}
      >
        {children}
      </button>
    );
  }
  if (item.href) {
    return (
      <Link href={item.href} title={label} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <div title={label} className={className}>
      {children}
    </div>
  );
}

export function CalendarChip({
  item,
  isAdmin,
  onSelectEntry,
  className,
}: {
  item: CalendarItem;
  isAdmin: boolean;
  onSelectEntry: (entry: CalendarEntry) => void;
  className?: string;
}): React.ReactElement {
  return (
    <CalendarItemAction
      item={item}
      isAdmin={isAdmin}
      onSelectEntry={onSelectEntry}
      className={cn(
        "flex min-h-5 w-full min-w-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold leading-tight text-foreground transition-[filter] hover:brightness-110 dark:hover:brightness-125",
        calendarTint(item.type),
        !item.isPublic && "border border-dashed border-foreground/40",
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", calendarAccent(item.type))} />
      <span className="min-w-0 break-words">{item.name}</span>
    </CalendarItemAction>
  );
}
