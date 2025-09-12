"use client";

import { useState, useEffect } from "react";

const BINGO_TIME_EST = new Date("2025-09-12T15:00:00-04:00");

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function Countdown() {
  const [remaining, setRemaining] = useState(getTimeRemaining(BINGO_TIME_EST));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(BINGO_TIME_EST));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { days, hours, minutes, seconds } = remaining;

  if (new Date() >= BINGO_TIME_EST) {
    return (
      <div className="text-3xl md:text-5xl w-fit mx-auto mt-24 text-stability">
        Bingo is live! Come back soon for the board.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full mt-24">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-stability drop-shadow-lg">
        Time until Bingo
      </h1>
      <div className="flex gap-6 md:gap-12 text-5xl md:text-8xl font-mono font-black text-stability drop-shadow-xl">
        <div className="flex flex-col items-center">
          <span>{String(days).padStart(2, "0")}</span>
          <span className="text-base md:text-2xl font-semibold text-foreground">
            days
          </span>
        </div>
        <span className="text-4xl md:text-6xl text-foreground">:</span>
        <div className="flex flex-col items-center">
          <span>{String(hours).padStart(2, "0")}</span>
          <span className="text-base md:text-2xl font-semibold text-foreground">
            hours
          </span>
        </div>
        <span className="text-4xl md:text-6xl text-foreground">:</span>
        <div className="flex flex-col items-center">
          <span>{String(minutes).padStart(2, "0")}</span>
          <span className="text-base md:text-2xl font-semibold text-foreground">
            min
          </span>
        </div>
        <span className="text-4xl md:text-6xl text-foreground">:</span>
        <div className="flex flex-col items-center">
          <span>{String(seconds).padStart(2, "0")}</span>
          <span className="text-base md:text-2xl font-semibold text-foreground">
            sec
          </span>
        </div>
      </div>
    </div>
  );
}
