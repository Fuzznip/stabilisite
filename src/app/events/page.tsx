import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEvents } from "@/lib/fetch/getBingo";
import {
  countdownLabel,
  elapsedPercent,
  eventAccent,
  eventHref,
  eventPhase,
  eventTypeLabel,
  isReleased,
  type EventPhase,
} from "@/lib/events";
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

function formatRange(event: Event): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  const sameYear = start.getFullYear() === end.getFullYear();
  const year = end.getFullYear();
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString(
    "en-US",
    sameYear ? opts : { ...opts, year: "numeric" },
  )}${sameYear ? `, ${year}` : ""}`;
}

function MaybeLink({
  event,
  now,
  children,
}: {
  event: Event;
  now: Date;
  children: React.ReactNode;
}): React.ReactElement {
  if (!isReleased(event, now)) return <>{children}</>;
  return (
    <Link href={eventHref(event)} className="group block">
      {children}
    </Link>
  );
}

function AccentDot({
  type,
  className,
}: {
  type: Event["type"];
  className?: string;
}): React.ReactElement {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 shrink-0 rounded-full",
        eventAccent(type),
        className,
      )}
    />
  );
}

function LiveEvent({
  event,
  now,
}: {
  event: Event;
  now: Date;
}): React.ReactElement {
  return (
    <MaybeLink event={event} now={now}>
      <div className="rounded-xl border border-stability bg-stability/5 p-6 sm:p-8 transition-colors group-hover:bg-stability/10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-stability opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex size-2.5 rounded-full bg-stability" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-stability-accent">
            Live
          </span>
          <span aria-hidden className="text-foreground/25">
            ·
          </span>
          <span className="text-sm text-foreground/70">
            {eventTypeLabel(event.type)}
          </span>
          <span className="ml-auto text-sm font-semibold text-foreground/80">
            {countdownLabel(event, now)}
          </span>
        </div>

        <h3 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight text-foreground">
          {event.name}
        </h3>
        <p className="mt-1.5 text-sm text-foreground/60">
          {formatRange(event)}
        </p>

        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-stability"
            style={{ width: `${elapsedPercent(event, now)}%` }}
          />
        </div>
      </div>
    </MaybeLink>
  );
}

function UpcomingEvent({
  event,
  now,
}: {
  event: Event;
  now: Date;
}): React.ReactElement {
  const released = isReleased(event, now);
  return (
    <MaybeLink event={event} now={now}>
      <div
        className={cn(
          "flex h-full min-h-36 flex-col rounded-xl border border-border bg-card p-5 transition-colors",
          released &&
            "group-hover:border-foreground/30 group-hover:bg-accent/40",
        )}
      >
        <div className="flex items-center gap-2">
          <AccentDot
            type={event.type}
            className={cn(!released && "opacity-40")}
          />
          <span className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
            {eventTypeLabel(event.type)}
          </span>
        </div>

        <h3 className="mt-3 text-xl font-bold leading-tight text-foreground">
          {event.name}
        </h3>

        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-4">
          <span className="text-sm text-foreground/60">
            {formatRange(event)}
          </span>
          <span className="text-sm font-semibold text-foreground/70">
            {released ? countdownLabel(event, now) : "Coming soon"}
          </span>
        </div>
      </div>
    </MaybeLink>
  );
}

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
  const events = await getEvents();
  const now = new Date();

  const byPhase: Record<EventPhase, Event[]> = {
    active: [],
    upcoming: [],
    past: [],
  };
  for (const event of events ?? []) {
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
