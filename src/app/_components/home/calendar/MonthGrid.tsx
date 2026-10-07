"use client";

import { cn } from "@/lib/utils";
import { layoutWeek, monthWeeks } from "@/lib/calendar/grid";
import type { CalendarEntry, CalendarItem } from "@/lib/types/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarChip } from "./CalendarChip";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_LANES = 3;
const LANE_REM = 1.5; // 1.25rem bar + 0.25rem gap

export function MonthGrid({
  month,
  today,
  items,
  isAdmin,
  onSelectEntry,
}: {
  month: string;
  today: string;
  items: CalendarItem[];
  isAdmin: boolean;
  onSelectEntry: (entry: CalendarEntry) => void;
}): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[0.65rem] font-bold uppercase tracking-widest text-foreground/60"
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
              minHeight: `${2.25 + MAX_LANES * LANE_REM + 1.25}rem`,
              // Day-number header, one auto-height row per lane so wrapped
              // names push the week taller, then room for "+N more".
              gridTemplateRows: `2.25rem repeat(${MAX_LANES}, auto) minmax(1.25rem, 1fr)`,
            }}
          >
            {week.map((day, col) => (
              <div
                key={day.date}
                className={cn(
                  "flex flex-col justify-between p-1.5",
                  col < week.length - 1 && "border-r",
                  !day.inMonth && "bg-muted/30",
                )}
                style={{ gridColumn: col + 1, gridRow: "1 / -1" }}
              >
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                    day.inMonth ? "text-foreground/80" : "text-foreground/35",
                    day.date === today && "font-bold text-foreground ring-2 ring-stability",
                  )}
                >
                  {Number(day.date.slice(8))}
                </span>
                {hidden[col].length > 0 && (
                  <Popover>
                    <PopoverTrigger className="cursor-pointer self-start text-[0.65rem] font-semibold text-foreground/60 hover:text-foreground hover:underline">
                      +{hidden[col].length} more
                    </PopoverTrigger>
                    <PopoverContent className="flex w-56 flex-col gap-1 p-2">
                      {hidden[col].map((item) => (
                        <CalendarChip
                          key={item.key}
                          item={item}
                          isAdmin={isAdmin}
                          onSelectEntry={onSelectEntry}
                        />
                      ))}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ))}

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
    </div>
  );
}
