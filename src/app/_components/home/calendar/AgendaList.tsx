"use client";

import { cn } from "@/lib/utils";
import { itemDays, monthLabel } from "@/lib/calendar/grid";
import { calendarAccent, calendarTypeLabel, formatItemWhen } from "@/lib/calendar/items";
import type { CalendarEntry, CalendarItem } from "@/lib/types/calendar";
import { CalendarItemAction } from "./CalendarChip";

/** The phone layout: what's still to come, grouped by month. */
export function AgendaList({
  items,
  today,
  isAdmin,
  onSelectEntry,
}: {
  items: CalendarItem[];
  today: string;
  isAdmin: boolean;
  onSelectEntry: (entry: CalendarEntry) => void;
}): React.ReactElement {
  const upcoming = items.filter((item) => itemDays(item.start, item.end).last >= today);
  if (upcoming.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-foreground/60">
        Nothing scheduled yet.
      </p>
    );
  }

  // A running item files under the current month, not the month it began.
  const groups = new Map<string, CalendarItem[]>();
  for (const item of upcoming) {
    const first = itemDays(item.start, item.end).first;
    const month = (first < today ? today : first).slice(0, 7);
    groups.set(month, [...(groups.get(month) ?? []), item]);
  }

  return (
    <div className="flex flex-col gap-5">
      {[...groups].map(([month, monthItems]) => (
        <div key={month} className="flex flex-col gap-2">
          <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-foreground/50">
            {monthLabel(month)}
          </h3>
          <ul className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card">
            {monthItems.map((item) => (
              <li key={item.key}>
                <CalendarItemAction
                  item={item}
                  isAdmin={isAdmin}
                  onSelectEntry={onSelectEntry}
                  className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <span aria-hidden className={cn("size-2 shrink-0 rounded-full", calendarAccent(item.type))} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold">{item.name}</span>
                    <span className="text-xs text-foreground/60">
                      {calendarTypeLabel(item.type)} · {formatItemWhen(item)}
                    </span>
                  </span>
                  {!item.isPublic && (
                    <span className="shrink-0 rounded-full border border-dashed border-foreground/40 px-2 py-0.5 text-[0.65rem] font-semibold text-foreground/70">
                      Staff only
                    </span>
                  )}
                </CalendarItemAction>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
