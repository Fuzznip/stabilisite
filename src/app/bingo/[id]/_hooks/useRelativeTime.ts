import { useState, useEffect, useMemo } from "react";

function getRelativeTimeString(date: Date, now: Date): string {
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return diffInSeconds <= 0
      ? "just now"
      : `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  }

  const timeIntervals = [
    { label: "minute", seconds: 60 },
    { label: "hour", seconds: 3600 },
    { label: "day", seconds: 86400 },
  ];

  for (let i = timeIntervals.length - 1; i >= 0; i--) {
    const { label, seconds } = timeIntervals[i];
    if (diffInSeconds >= seconds) {
      const value = Math.floor(diffInSeconds / seconds);
      return `${value} ${label}${value !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

export function useRelativeTime(date: Date | string | number) {
  const pastDate = useMemo(() => new Date(date), [date]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, [pastDate]);

  return useMemo(() => getRelativeTimeString(pastDate, now), [pastDate, now]);
}
