import { Suspense } from "react";
import type { Metadata } from "next";
import { getEvent } from "@/lib/fetch/getBingo";
import { getBotwBosses, getBotwLeaderboard } from "@/lib/fetch/getBotw";
import { cn } from "@/lib/utils";
import { BossCard } from "./_components/BossCard";
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
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold text-foreground">{event.name}</h1>
        <p className="text-lg text-foreground/60">Boss of the Week</p>
      </div>

      <section className="flex flex-col gap-4">
        {ordered.length === 0 ? (
          <p className="text-lg text-foreground/60">
            No bosses configured yet.
          </p>
        ) : (
          <div
            className={cn(
              "grid gap-5 items-stretch",
              // Up to three across, but fewer bosses stretch to fill the row
              // rather than leaving dead space beside a lone card.
              ordered.length === 1
                ? "grid-cols-1"
                : ordered.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {ordered.map((boss) => (
              <BossCard key={boss.id} boss={boss} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-foreground/80">
          Leaderboard
        </h2>
        <BotwLeaderboard eventId={id} initialData={standings} />
      </section>
    </div>
  );
}
