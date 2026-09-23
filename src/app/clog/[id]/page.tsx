import { Suspense } from "react";
import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { canViewEvent } from "@/lib/events";
import { getEvent } from "@/lib/fetch/getBingo";
import { getClogProgress, getClogSlots } from "@/lib/fetch/getClog";
import { EventCountdown } from "@/components/event-countdown/EventCountdown";
import {
  OSRS_TOKENS,
  PANEL_MAX_WIDTH,
} from "@/components/collection-log/OsrsPanel";
import { cn } from "@/lib/utils";
import { ClogBoard } from "./_components/ClogBoard";
import Loading from "./loading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  const range = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  return {
    title: `Collection Log Race: ${event.name}`,
    description: `Stability Collection Log Race — ${range(event.start_date)} to ${range(event.end_date)}`,
  };
}

export default async function ClogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<Loading />}>
      <ClogContent id={id} />
    </Suspense>
  );
}

async function ClogContent({ id }: { id: string }) {
  // Admin-only while the event is still being built out. Matches how the old
  // collection log page gated itself, down to the deliberately unhelpful copy.
  const user = await getAuthUser();
  // Same rule the events listing uses, so the page and the listing cannot
  // disagree about whether this event type is public yet.
  if (!canViewEvent({ type: "clog" }, user?.isAdmin)) {
    return (
      <Alert className="mx-auto w-1/2 bg-muted">
        <TriangleAlert className="size-4" />
        <AlertTitle>Page not found</AlertTitle>
        <AlertDescription>What are you trying to do?</AlertDescription>
      </Alert>
    );
  }

  const [event, slots, progress] = await Promise.all([
    getEvent(id),
    getClogSlots(id),
    getClogProgress(id),
  ]);


  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-20">
      {/* Same cap and centring as the board below, so the title starts where
          the log panel does instead of at the page edge on wide screens. */}
      <header
        className={cn(
          "flex w-full mx-auto flex-col gap-1",
          OSRS_TOKENS,
          PANEL_MAX_WIDTH,
        )}
      >
        <h1 className="text-2xl sm:text-4xl font-semibold uppercase leading-none">
          {event.name}
        </h1>
        <EventCountdown
          startDate={event.start_date}
          endDate={event.end_date}
        />
      </header>

      {/* The leaderboard lives inside ClogBoard: selecting a team both opens its
          detail pane and swaps the log below, so the two share one selection. */}
      <ClogBoard eventId={id} slots={slots} progress={progress} />
    </div>
  );
}
