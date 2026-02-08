"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type EventCountdownProps = {
  startDate: Date;
  endDate: Date;
};

type EventStatus = "upcoming" | "ongoing" | "ended";

function getEventStatus(startDate: Date, endDate: Date): EventStatus {
  const now = new Date();
  if (now < startDate) return "upcoming";
  if (now < endDate) return "ongoing";
  return "ended";
}

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
  const status = getEventStatus(startDate, endDate);

  if (status === "upcoming") {
    return formatTimeDiff(startDate.getTime() - now.getTime(), "Starts in");
  } else if (status === "ongoing") {
    return formatTimeDiff(endDate.getTime() - now.getTime(), "");
  }
  return "Event ended";
}

export function EventCountdown({ startDate, endDate }: EventCountdownProps) {
  const [countdown, setCountdown] = useState(getCountdownText(startDate, endDate));
  const [status, setStatus] = useState<EventStatus>(getEventStatus(startDate, endDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownText(startDate, endDate));
      setStatus(getEventStatus(startDate, endDate));
    }, 60000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  return (
    <>
      <p className="text-lg text-foreground">{countdown}</p>
      {status === "upcoming" ? (
        <Button className="absolute bottom-4 right-4 cursor-not-allowed" size="sm" disabled>
          Coming Soon!
        </Button>
      ) : status === "ongoing" ? (
        <Button asChild className="absolute bottom-4 right-4" size="sm">
          <Link href="/bingo">
            View Event <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      ) : null}
    </>
  );
}
