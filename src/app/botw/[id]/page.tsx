import { Suspense } from "react";
import type { Metadata } from "next";
import { getEvent } from "@/lib/fetch/getBingo";
import { getBotwBosses, getBotwLeaderboard } from "@/lib/fetch/getBotw";
import { BossHeader } from "./_components/BossHeader";
import { BotwLeaderboard } from "./_components/BotwLeaderboard";
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
    title: event.name,
    description: `Stability Boss of the Week — ${range(event.start_date)} to ${range(event.end_date)}`,
  };
}

export default async function BotwPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<Loading />}>
      <BotwContent id={id} />
    </Suspense>
  );
}

async function BotwContent({ id }: { id: string }) {
  const [event, bosses, standings] = await Promise.all([
    getEvent(id),
    getBotwBosses(id),
    getBotwLeaderboard(id),
  ]);

  const ordered = [...bosses].sort(
    (a, b) =>
      (a.display_order ?? Number.MAX_SAFE_INTEGER) -
        (b.display_order ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name),
  );

  return (
    <div className="flex flex-col gap-10 px-4 pb-20 w-full">
      <BossHeader event={event} bosses={ordered} />

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-foreground/80">
          Leaderboard
        </h2>
        <BotwLeaderboard eventId={id} initialData={standings} />
      </section>
    </div>
  );
}
