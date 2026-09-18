"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Time left in an event, ticking once a minute.
 *
 * Lifted out of the conquest page so every event type counts down the same way
 * and in the same words. It owns its own clock rather than taking `now` as a
 * prop — a countdown that only moved when its parent happened to re-render
 * would sit frozen on a page that is otherwise static.
 */
function remaining(target: Date, now: Date): string | null {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}D`);
  if (hours > 0 || days > 0) parts.push(`${hours}H`);
  parts.push(`${minutes}M`);
  return parts.join(" ");
}

export function EventCountdown({
  startDate,
  endDate,
  className,
}: {
  /** When given, an event that has not begun counts down to its start instead. */
  startDate?: string;
  endDate: string;
  className?: string;
}): React.ReactElement | null {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const start = startDate ? new Date(startDate) : null;
  const upcoming = start !== null && start.getTime() > now.getTime();
  const label = upcoming ? "Starts in" : "Ends in";
  const left = remaining(upcoming ? start : new Date(endDate), now);

  return (
    <span
      // The first paint happens on the server, so the minute shown can differ
      // from the client's by the time it hydrates. The value corrects itself on
      // the next tick; suppressing keeps that out of the console.
      suppressHydrationWarning
      className={cn(
        "font-mono text-xs uppercase text-muted-foreground",
        className,
      )}
    >
      {left ? (
        <>
          {label}{" "}
          <strong className="font-semibold text-foreground">{left}</strong>
        </>
      ) : (
        <strong className="font-semibold text-foreground">Ended</strong>
      )}
    </span>
  );
}
