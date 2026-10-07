import { buildCalendarItems } from "@/lib/calendar/items";
import { calendarWindow } from "@/lib/calendar/grid";
import { utcToEt } from "@/lib/calendar/time";
import type { CalendarActivity } from "@/lib/calendar/activity";
import type { CalendarEntry } from "@/lib/types/calendar";
import type { Event } from "@/lib/types/v2";
import { CalendarView } from "./CalendarView";

/** Server half: filters and merges here so private entries never reach a
 *  non-staff browser, then hands plain items to the interactive view. */
export function ClanCalendar({
  entries,
  events,
  activity,
  isAdmin,
  now,
}: {
  entries: CalendarEntry[];
  events: Event[];
  /** Splits and promotions, which are public, so they pass through as-is. */
  activity: CalendarActivity[];
  isAdmin: boolean;
  now: Date;
}): React.ReactElement {
  const { minMonth, maxMonth } = calendarWindow(now);
  return (
    <CalendarView
      items={buildCalendarItems(entries, events, isAdmin, now)}
      activity={activity}
      linkableEvents={isAdmin ? events : []}
      isAdmin={isAdmin}
      today={utcToEt(now).date}
      minMonth={minMonth}
      maxMonth={maxMonth}
    />
  );
}
