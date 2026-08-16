import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
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

// No `revalidate`: reading the session to gate on admin makes this route
// per-user and dynamic, so a route-level cache window would never apply. The
// underlying getEvents() fetch is still tag-revalidated on "bingo-event".

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
        "h-44 w-full border-stability transition-transform " +
        (released ? "hover:scale-[1.01]" : "opacity-60")
      }
    >
      <CardContent className="h-full flex flex-col justify-between p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{eventTypeLabel(event.type)}</Badge>
          </div>
          <h3 className="text-2xl font-bold text-foreground leading-tight">
            {event.name}
          </h3>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="text-sm text-foreground/60">{formatRange(event)}</p>
          {released ? (
            // A span, not a Button: the whole card is already a Link, and
            // nesting a button inside an anchor is invalid. `group-hover`
            // drives the hover state from the card rather than the pill, so
            // it reacts anywhere on the card — which is what's clickable.
            <span
              className={cn(
                buttonVariants({ size: "sm" }),
                // Filled, not outlined: the card itself carries a red border,
                // so an outlined button reads as part of it. Fill against
                // outline is what separates the action from its container.
                //
                // Brand red rather than the theme's primary, which is
                // near-white in dark mode. White on --stability is 5.99:1.
                // The bare `hover:` displaces the variant's own
                // hover:bg-primary/90 for anyone pointing straight at the pill.
                "bg-stability text-white hover:bg-stability/90 group-hover:bg-stability/90",
              )}
            >
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
    <Link href={eventHref(event)} className="group block">
      {card}
    </Link>
  ) : (
    card
  );
}

function EventSection({ title, events }: { title: string; events: Event[] }) {
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
  // Checked before fetching, unlike the applications page, so a non-admin
  // request does not pay for data it will never render.
  const user = await getAuthUser();
  if (!user?.isAdmin) {
    return (
      <Alert className="w-1/2 mx-auto bg-muted">
        <TriangleAlert className="size-4" />
        <AlertTitle>Page not found</AlertTitle>
        <AlertDescription>What are you trying to do?</AlertDescription>
      </Alert>
    );
  }

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
