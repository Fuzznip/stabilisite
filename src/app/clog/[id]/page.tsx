import { Suspense } from "react";
import type { Metadata } from "next";
import { getEvent } from "@/lib/fetch/getBingo";
import { getClogProgress, getClogSlots } from "@/lib/fetch/getClog";
import { ClogBoard } from "./_components/ClogBoard";
import { ClogLeaderboard } from "./_components/ClogLeaderboard";
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
  const [event, slots, progress] = await Promise.all([
    getEvent(id),
    getClogSlots(id),
    getClogProgress(id),
  ]);

  const totalPoints = slots.reduce((sum, slot) => sum + slot.points, 0);

  return (
    <div className="flex w-full flex-col gap-10 px-4 pb-20">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground/80">
          {event.name}
        </h1>
        <ClogLeaderboard progress={progress} totalPoints={totalPoints} />
      </section>

      <ClogBoard slots={slots} progress={progress} />
    </div>
  );
}
