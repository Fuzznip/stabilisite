import { formatDistanceToNowStrict } from "date-fns";
import type { Event, EventType } from "@/lib/types/v2";

/** Where an event's own page lives. Bingo is the fallback for older events
 *  created before `type` was set on every row. */
export function eventHref(event: Pick<Event, "id" | "type">): string {
  switch (event.type) {
    case "conquest":
      return `/conquest/${event.id}`;
    case "botw":
      return `/botw/${event.id}`;
    default:
      return `/bingo/${event.id}`;
  }
}

export function eventTypeLabel(type: EventType | undefined): string {
  switch (type) {
    case "conquest":
      return "Conquest";
    case "botw":
      return "Boss of the Week";
    default:
      return "Bingo";
  }
}

export type EventPhase = "active" | "upcoming" | "past";

export function eventPhase(
  event: Pick<Event, "start_date" | "end_date">,
  now: Date = new Date(),
): EventPhase {
  if (now >= new Date(event.end_date)) return "past";
  if (now < new Date(event.start_date)) return "upcoming";
  return "active";
}

/** An event is only linkable once its release date has passed — that is what
 *  gates a not-yet-announced event from being browsable. */
export function isReleased(
  event: Pick<Event, "release_date">,
  now: Date = new Date(),
): boolean {
  return !event.release_date || now >= new Date(event.release_date);
}

/** The background utility for an event type's accent dot. Returns whole class
 *  names rather than an interpolated fragment, because Tailwind scans source
 *  text and never sees a class assembled at runtime. */
export function eventAccent(type: EventType | undefined): string {
  switch (type) {
    case "conquest":
      return "bg-event-conquest";
    case "botw":
      return "bg-event-botw";
    default:
      return "bg-event-bingo";
  }
}

/** The phase-appropriate relative time — the thing a date range alone never
 *  tells you, and the reason to look at a live event at all. */
export function countdownLabel(
  event: Pick<Event, "start_date" | "end_date">,
  now: Date = new Date(),
): string {
  const opts = { addSuffix: false } as const;
  switch (eventPhase(event, now)) {
    case "active":
      return `Ends in ${formatDistanceToNowStrict(new Date(event.end_date), opts)}`;
    case "upcoming":
      return `Starts in ${formatDistanceToNowStrict(new Date(event.start_date), opts)}`;
    case "past":
      return `Ended ${formatDistanceToNowStrict(new Date(event.end_date), opts)} ago`;
  }
}

/** How far a running event has progressed, 0–100, for the hero's elapsed bar.
 *  Clamped because an event can be edited to start after it ends. */
export function elapsedPercent(
  event: Pick<Event, "start_date" | "end_date">,
  now: Date = new Date(),
): number {
  const start = new Date(event.start_date).getTime();
  const end = new Date(event.end_date).getTime();
  if (!(end > start)) return 100;
  return Math.min(100, Math.max(0, ((now.getTime() - start) / (end - start)) * 100));
}
