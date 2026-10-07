"use client";

import { useMemo, useState } from "react";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { itemDays, layoutWeek, monthWeeks } from "@/lib/calendar/grid";
import { activityByDay, type CalendarActivity } from "@/lib/calendar/activity";
import type { CalendarEntry, CalendarItem } from "@/lib/types/calendar";
import { CalendarChip } from "./CalendarChip";
import { ActivityChip, CalendarDayDialog } from "./CalendarDayDialog";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_LANES = 3;
/** Splits and promotions shown in a cell before the rest go behind "Expand". */
const MAX_ACTIVITY = 2;
/** An empty week still gets room for a couple of bars. */
const MIN_WEEK_REM = 8.5;

const NO_ACTIVITY: CalendarActivity[] = [];

export function MonthGrid({
  month,
  today,
  items,
  activity,
  isAdmin,
  onSelectEntry,
}: {
  month: string;
  today: string;
  items: CalendarItem[];
  activity: CalendarActivity[];
  isAdmin: boolean;
  onSelectEntry: (entry: CalendarEntry) => void;
}): React.ReactElement {
  const byDay = useMemo(() => activityByDay(activity), [activity]);
  // The day outlives `dayOpen` so the dialog keeps its content while it fades out.
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [dayOpen, setDayOpen] = useState(false);
  const showDay = (day: string) => {
    setOpenDay(day);
    setDayOpen(true);
  };

  const dayEvents = openDay
    ? items.filter((item) => {
        const { first, last } = itemDays(item.start, item.end);
        return first <= openDay && openDay <= last;
      })
    : [];

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-bold uppercase tracking-widest text-foreground/60"
          >
            {day}
          </div>
        ))}
      </div>

      {monthWeeks(month).map((week) => {
        const { spans, hidden } = layoutWeek(week, items, MAX_LANES);
        return (
          <div
            key={week[0].date}
            className="grid grid-cols-7 border-b last:border-b-0"
            style={{
              minHeight: `${MIN_WEEK_REM}rem`,
              // Day-number header, one auto-height row per lane so wrapped
              // names push the week taller, then splits, promotions and "Expand".
              gridTemplateRows: `2.5rem repeat(${MAX_LANES}, auto) minmax(1.5rem, 1fr)`,
            }}
          >
            {week.map((day, col) => (
              <div
                key={day.date}
                className={cn(
                  "p-1.5",
                  col < week.length - 1 && "border-r",
                  !day.inMonth && "bg-muted/30",
                )}
                style={{ gridColumn: col + 1, gridRow: "1 / -1" }}
              >
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-sm tabular-nums",
                    day.inMonth ? "text-foreground/80" : "text-foreground/35",
                    day.date === today && "font-bold text-foreground ring-2 ring-stability",
                  )}
                >
                  {Number(day.date.slice(8))}
                </span>
              </div>
            ))}

            {week.map((day, col) => {
              const dayActivity = byDay.get(day.date) ?? NO_ACTIVITY;
              const overflow =
                hidden[col].length + Math.max(0, dayActivity.length - MAX_ACTIVITY);
              if (dayActivity.length === 0 && overflow === 0) return null;
              return (
                <div
                  key={`activity-${day.date}`}
                  className="flex min-w-0 flex-col gap-1 px-1 pb-1.5"
                  style={{ gridColumn: col + 1, gridRow: MAX_LANES + 2 }}
                >
                  {dayActivity.slice(0, MAX_ACTIVITY).map((item) => (
                    <ActivityChip key={item.id} item={item} onClick={() => showDay(day.date)} />
                  ))}
                  {overflow > 0 && (
                    <button
                      type="button"
                      onClick={() => showDay(day.date)}
                      aria-label={`Expand ${day.date}: ${overflow} more`}
                      className="flex cursor-pointer items-center gap-1.5 self-start rounded-md px-2 py-1 text-sm font-semibold text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Maximize2 aria-hidden className="size-3.5" />
                      Expand
                      <span className="text-foreground/45">+{overflow}</span>
                    </button>
                  )}
                </div>
              );
            })}

            {spans.map((span) => (
              <div
                key={span.item.key}
                className="min-w-0 px-1 pb-1"
                style={{
                  gridColumn: `${span.startCol + 1} / ${span.endCol + 1}`,
                  gridRow: span.lane + 2,
                }}
              >
                <CalendarChip
                  item={span.item}
                  isAdmin={isAdmin}
                  onSelectEntry={onSelectEntry}
                  className={cn(
                    span.continuesBefore && "-ml-1 rounded-l-none",
                    span.continuesAfter && "-mr-1 rounded-r-none",
                  )}
                />
              </div>
            ))}
          </div>
        );
      })}

      {openDay && (
        <CalendarDayDialog
          day={openDay}
          open={dayOpen}
          onOpenChange={setDayOpen}
          events={dayEvents}
          activity={byDay.get(openDay) ?? NO_ACTIVITY}
          isAdmin={isAdmin}
          onSelectEntry={(entry) => {
            setDayOpen(false);
            onSelectEntry(entry);
          }}
        />
      )}
    </div>
  );
}
