import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  countdownLabel,
  elapsedPercent,
  eventAccent,
  eventHref,
  eventTypeLabel,
  isReleased,
} from "@/lib/events";
import type { Event } from "@/lib/types/v2";

/** Shared between the events listing and the homepage strip, so a change to
 *  how a live event reads only has to be made once. */

export function formatRange(event: Event): string {
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

export function MaybeLink({
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

export function AccentDot({
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

export function LiveEvent({
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

export function UpcomingEvent({
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
