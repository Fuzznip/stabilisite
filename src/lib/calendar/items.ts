import {
  canViewEvent,
  eventAccent,
  eventHref,
  eventTypeLabel,
  isReleased,
} from "@/lib/events";
import type { CalendarEntry, CalendarEntryType, CalendarItem } from "@/lib/types/calendar";
import type { Event } from "@/lib/types/v2";
import { CLAN_TZ } from "./time";

/** Merges staff entries with v2 events. An event already linked from an entry
 *  is not shown twice, and private entries never reach non-admins — this runs
 *  in a server component, so filtered rows never leave the server. */
export function buildCalendarItems(
  entries: CalendarEntry[],
  events: Event[],
  isAdmin: boolean,
  now: Date,
): CalendarItem[] {
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const visible = entries.filter((entry) => isAdmin || entry.is_public);
  // Only visible entries stand in for their event: a staff-only entry must not
  // hide the real event from members.
  const linked = new Set(visible.map((entry) => entry.event_id).filter(Boolean));
  const linkTo = (event: Event | undefined) =>
    event && isReleased(event, now) ? eventHref(event) : undefined;

  const fromEntries: CalendarItem[] = visible
    .map((entry) => ({
      key: `entry-${entry.id}`,
      name: entry.name,
      type: entry.type,
      start: new Date(entry.start_date),
      end: new Date(entry.end_date),
      allDay: entry.all_day,
      isPublic: entry.is_public,
      href: linkTo(entry.event_id ? eventsById.get(entry.event_id) : undefined),
      entry,
    }));

  const fromEvents: CalendarItem[] = events
    .filter((event) => !linked.has(event.id) && canViewEvent(event, isAdmin))
    .map((event) => ({
      key: `event-${event.id}`,
      name: event.name,
      type: event.type ?? "bingo",
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      allDay: false,
      isPublic: true,
      href: linkTo(event),
    }));

  return [...fromEntries, ...fromEvents].sort((a, b) => +a.start - +b.start);
}

export function calendarAccent(type: CalendarEntryType): string {
  return type === "adhoc" ? "bg-event-adhoc" : eventAccent(type);
}

/** Soft fill for a bar. Literal class names so Tailwind can see them. */
export function calendarTint(type: CalendarEntryType): string {
  switch (type) {
    case "conquest":
      return "bg-event-conquest/15";
    case "botw":
      return "bg-event-botw/15";
    case "clog":
      return "bg-event-clog/15";
    case "adhoc":
      return "bg-event-adhoc/15";
    default:
      return "bg-event-bingo/15";
  }
}

export function calendarTypeLabel(type: CalendarEntryType): string {
  return type === "adhoc" ? "Custom" : eventTypeLabel(type);
}

const DAY: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: CLAN_TZ };
const TIME: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", timeZone: CLAN_TZ };

/** "Oct 8", "Oct 8 – Oct 10", "Oct 8, 8:00 PM – 10:00 PM ET". */
export function formatItemWhen(item: CalendarItem): string {
  const startDay = item.start.toLocaleDateString("en-US", DAY);
  if (item.allDay) {
    const lastDay = new Date(item.end.getTime() - 1).toLocaleDateString("en-US", DAY);
    return startDay === lastDay ? startDay : `${startDay} – ${lastDay}`;
  }
  const endDay = item.end.toLocaleDateString("en-US", DAY);
  const startTime = item.start.toLocaleTimeString("en-US", TIME);
  const endTime = item.end.toLocaleTimeString("en-US", TIME);
  return startDay === endDay
    ? `${startDay}, ${startTime} – ${endTime} ET`
    : `${startDay} ${startTime} – ${endDay} ${endTime} ET`;
}
