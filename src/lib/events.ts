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
