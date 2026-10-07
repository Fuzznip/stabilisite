import { buildCalendarItems } from "@/lib/calendar/items";
import { calendarWindow } from "@/lib/calendar/grid";
import { utcToEt } from "@/lib/calendar/time";
import type { CalendarEntry } from "@/lib/types/calendar";
import type { Event } from "@/lib/types/v2";
import { CalendarView } from "./CalendarView";

/** Server half: filters and merges here so private entries never reach a
 *  non-staff browser, then hands plain items to the interactive view. */
export function ClanCalendar({
  entries,
  events,
  isAdmin,
  now,
}: {
  entries: CalendarEntry[];
  events: Event[];
  isAdmin: boolean;
  now: Date;
}): React.ReactElement {
  const { minMonth, maxMonth } = calendarWindow(now);
  return (
    <CalendarView
      items={buildCalendarItems(entries, events, isAdmin, now)}
      linkableEvents={isAdmin ? events : []}
      isAdmin={isAdmin}
      today={utcToEt(now).date}
      minMonth={minMonth}
      maxMonth={maxMonth}
    />
  );
}
