import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEvents } from "@/lib/fetch/getBingo";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import {
  canViewEvent,
  eventHref,
  eventPhase,
  eventTypeLabel,
  isReleased,
  type EventPhase,
} from "@/lib/events";
import {
  AccentDot,
  LiveEvent,
  UpcomingEvent,
} from "@/components/events/EventCards";
import type { Event } from "@/lib/types/v2";
import PastEvents from "./_components/PastEvents";

export const metadata: Metadata = {
  title: "Events",
  description: "Stability clan events — active, upcoming and past.",
};

// No `revalidate`: `now` below drives every phase bucket, countdown and release
// check, so this route must not be prerendered. It stays dynamic because the
// root layout's NavBar reads the session — if that ever stops being true, this
// page needs its own `await connection()`. getEvents() is tag-revalidated on
// "bingo-event" either way.

function PastEventRow({
  event,
  now,
}: {
  event: Event;
  now: Date;
}): React.ReactElement {
  const released = isReleased(event, now);
  const row = (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors",
        released && "group-hover:bg-accent/50",
      )}
    >
      <AccentDot type={event.type} className={cn(!released && "opacity-40")} />
      <span className="hidden w-32 shrink-0 truncate text-[11px] font-semibold uppercase tracking-widest text-foreground/65 sm:block">
        {eventTypeLabel(event.type)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground/90">
        {event.name}
      </span>
      <span className="shrink-0 text-xs text-foreground/65">
        {format(new Date(event.end_date), "MMM yyyy")}
      </span>
      <ChevronRight
        aria-hidden
        className={cn(
          "size-4 shrink-0 text-foreground/25",
          released ? "group-hover:text-foreground/60" : "invisible",
        )}
      />
    </div>
  );

  return released ? (
    <Link href={eventHref(event)} className="group block">
      {row}
    </Link>
  ) : (
    row
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/65">
      {children}
    </h2>
  );
}

export default async function EventsPage() {
  const [events, user] = await Promise.all([getEvents(), getAuthUser()]);
  const now = new Date();

  // Filtered before bucketing so a hidden event cannot leak through a phase
  // count, the past-events toggle, or an empty-state check.
  const visible = (events ?? []).filter((event) =>
    canViewEvent(event, user?.isAdmin),
  );

  const byPhase: Record<EventPhase, Event[]> = {
    active: [],
    upcoming: [],
    past: [],
  };
  for (const event of visible) {
    byPhase[eventPhase(event, now)].push(event);
  }

  // Active and upcoming read forwards in time; past reads backwards, so the
  // most recently finished event is the first one you see.
  byPhase.active.sort((a, b) => +new Date(a.end_date) - +new Date(b.end_date));
  byPhase.upcoming.sort(
    (a, b) => +new Date(a.start_date) - +new Date(b.start_date),
  );
  byPhase.past.sort((a, b) => +new Date(b.end_date) - +new Date(a.end_date));

  const total =
    byPhase.active.length + byPhase.upcoming.length + byPhase.past.length;

  if (total === 0) {
    return (
      <div className="flex w-full max-w-6xl mx-auto flex-col gap-10 px-4 pb-20">
        <h1 className="text-3xl font-bold text-foreground">Events</h1>
        <div className="flex flex-col items-center gap-3 py-20 text-foreground/60">
          <CalendarDays className="size-10" />
          <p>No events yet. Check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-6xl mx-auto flex-col gap-10 px-4 pb-20">
      <h1 className="text-3xl font-bold text-foreground">Events</h1>

      {byPhase.active.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading>Happening now</SectionHeading>
          {byPhase.active.length > 0 ? (
            byPhase.active.map((event) => (
              <LiveEvent key={event.id} event={event} now={now} />
            ))
          ) : (
            <p className="text-sm text-foreground/65">
              Nothing running right now.
            </p>
          )}
        </section>
      )}

      {byPhase.upcoming.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading>Upcoming</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {byPhase.upcoming.map((event) => (
              <UpcomingEvent key={event.id} event={event} now={now} />
            ))}
          </div>
        </section>
      )}

      {byPhase.past.length > 0 && (
        <PastEvents count={byPhase.past.length}>
          {byPhase.past.map((event) => (
            <PastEventRow key={event.id} event={event} now={now} />
          ))}
        </PastEvents>
      )}
    </div>
  );
}
