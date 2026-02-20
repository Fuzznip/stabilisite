import { Suspense } from "react";
import { Metadata } from "next";
import { BingoClientWrapper } from "./_components/BingoClientWrapper";
import Loading from "./loading";
import { getEvent } from "@/lib/fetch/getBingo";
import { getAuthUser } from "@/lib/fetch/getAuthUser";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  return {
    title: event.name,
    description: `Stability clan event from ${new Date(event.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} to ${new Date(event.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<Loading />}>
      <EventContent id={id} />
    </Suspense>
  );
}

async function EventContent({ id }: { id: string }) {
  const event = await getEvent(id);

  return (
    <BingoClientWrapper
      endDate={event.end_date}
      teams={event.teams}
      tiles={event.tiles}
      eventId={event.id}
    />
  );
}
