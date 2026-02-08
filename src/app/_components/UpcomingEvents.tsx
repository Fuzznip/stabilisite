import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { EventCountdown } from "./EventCountdown";

// Feb 20th 2026, 3pm EST (UTC-5)
const BINGO_START_DATE = new Date("2026-02-20T15:00:00-05:00");
// March 1st 2026, 3pm EST (UTC-5)
const BINGO_END_DATE = new Date("2026-03-01T15:00:00-05:00");

export function UpcomingEvents() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl text-foreground">Upcoming Events</h2>
      <Card className="relative overflow-hidden h-48 w-full sm:w-96">
        <Image
          src="/bingo_bg.png"
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <CardContent className="relative z-10 h-full flex flex-col justify-center p-6">
          <h3 className="text-3xl font-bold text-foreground">
            Winter Bingo 2026
          </h3>
          <EventCountdown
            startDate={BINGO_START_DATE}
            endDate={BINGO_END_DATE}
          />
        </CardContent>
      </Card>
    </div>
  );
}
