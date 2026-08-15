import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEvents } from "@/lib/fetch/getBingo";
import {
  eventHref,
  eventPhase,
  eventTypeLabel,
  isReleased,
  type EventPhase,
} from "@/lib/events";
import type { Event } from "@/lib/types/v2";

export const metadata: Metadata = {
  title: "Events",
  description: "Stability clan events — active, upcoming and past.",
};

// Events start and end on their own schedule, so a cached page goes stale on a
// boundary no request triggers. A minute is well inside the resolution anyone
// cares about for a multi-day event.
export const revalidate = 60;

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

function EventCard({ event }: { event: Event }) {
  const phase = eventPhase(event);
  const released = isReleased(event);

  const card = (
    <Card
      className={
        "relative overflow-hidden h-44 w-full transition-transform " +
        (released ? "hover:scale-[1.01] hover:border-stability/60" : "opacity-60")
      }
    >
      <Image
        src="/map_background.png"
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 33vw"
        className="object-cover opacity-25"
      />
      <CardContent className="relative z-10 h-full flex flex-col justify-between p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{eventTypeLabel(event.type)}</Badge>
            {phase === "active" && (
              <Badge className="bg-stability text-white hover:bg-stability">
                Live
              </Badge>
            )}
          </div>
          <h3 className="text-2xl font-bold text-foreground leading-tight">
            {event.name}
          </h3>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="text-sm text-foreground/60">{formatRange(event)}</p>
          {released ? (
            <span className="text-sm font-semibold text-stability-accent inline-flex items-center gap-1">
              View <ArrowRight className="size-4" />
            </span>
          ) : (
            <span className="text-sm text-foreground/50">Coming soon</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // An unreleased event has nothing to show yet, so it renders as a dead card
  // rather than a link into an empty page.
  return released ? (
    <Link href={eventHref(event)} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

function EventSection({
  title,
  events,
}: {
  title: string;
  events: Event[];
}) {
  if (events.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground/80">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
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

  return (
    <div className="flex flex-col gap-10 px-4 pb-20 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">Events</h1>
        <p className="text-foreground/60">
          Every Stability event, past and present.
        </p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-foreground/60">
          <CalendarDays className="size-10" />
          <p>No events yet. Check back soon.</p>
        </div>
      ) : (
        <>
          <EventSection title="Happening now" events={byPhase.active} />
          <EventSection title="Upcoming" events={byPhase.upcoming} />
          <EventSection title="Past" events={byPhase.past} />
        </>
      )}
    </div>
  );
}
