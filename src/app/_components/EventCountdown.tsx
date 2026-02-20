"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Event } from "@/lib/types/v2";

function formatTimeDiff(diff: number, prefix: string): string {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${prefix} ${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${prefix} ${hours}h ${minutes}m`;
  } else {
    return `${prefix} ${minutes}m`;
  }
}

function getCountdownText(startDate: Date, endDate: Date): string {
  const now = new Date();
  if (now < startDate) {
    return formatTimeDiff(startDate.getTime() - now.getTime(), "Starts in");
  } else if (now < endDate) {
    return formatTimeDiff(endDate.getTime() - now.getTime(), "");
  }
  return "Event ended";
}

export function EventCountdown({ event }: { event: Event }) {
  const startDate = useMemo(() => new Date(event.start_date), [event]);
  const endDate = useMemo(() => new Date(event.end_date), [event]);
  const releaseDate = useMemo(() => new Date(event.release_date), [event]);

  const [countdown, setCountdown] = useState(
    getCountdownText(startDate, endDate),
  );
  const [isReleased, setIsReleased] = useState(() => new Date() >= releaseDate);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCountdown(getCountdownText(startDate, endDate));
      setIsReleased(now >= releaseDate);
    }, 60000);

    return () => clearInterval(interval);
  }, [startDate, endDate, releaseDate]);

  return (
    <>
      {<p className="text-lg text-foreground">{countdown}</p>}
      {isReleased ? (
        <Button asChild className="absolute bottom-4 right-4" size="sm">
          <Link href={`/bingo/${event.id}`}>
            View Event <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      ) : (
        <Button
          className="absolute bottom-4 right-4 cursor-not-allowed"
          size="sm"
          disabled
        >
          Coming Soon!
        </Button>
      )}
    </>
  );
}
