import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { EventCountdown } from "./EventCountdown";
import { getEvents } from "@/lib/fetch/getBingo";

export async function UpcomingEvents() {
  const events = await getEvents();
  const now = new Date();

  const upcomingEvents = events?.filter(
    (event) => new Date(event.end_date).getTime() - now.getTime() > 0,
  );
  return (
    upcomingEvents.length > 0 && (
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl text-foreground">Upcoming Events</h2>
        {events.map((event) => (
          <Card
            className="relative overflow-hidden h-48 w-full sm:w-96"
            key={event.id}
          >
            <Image
              src="/bingo_bg.png"
              alt=""
              fill
              className="object-cover opacity-30"
            />
            <CardContent className="relative z-10 h-full flex flex-col justify-center p-6">
              <h3 className="text-3xl font-bold text-foreground">
                {event.name}
              </h3>
              <EventCountdown event={event} />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );
}
