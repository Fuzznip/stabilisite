import { useState, useEffect } from "react";

function getRelativeTimeString(date: Date): string {
  const now = new Date();
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
  const pastDate = new Date(date);
  const [relativeTime, setRelativeTime] = useState(() =>
    getRelativeTimeString(pastDate)
  );

  useEffect(() => {
    const updateInterval = setInterval(
      () => {
        setRelativeTime(getRelativeTimeString(pastDate));
      },
      relativeTime.includes("seconds") || relativeTime.includes("just now")
        ? 1000
        : 30000
    );

    return () => clearInterval(updateInterval);
  }, [date]);

  return relativeTime;
}
