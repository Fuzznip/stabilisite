import { Suspense } from "react";
import { BingoClientWrapper } from "./_components/BingoClientWrapper";
import Loading from "./loading";
import { getEvent } from "@/lib/fetch/getBingo";
import { getAuthUser } from "@/lib/fetch/getAuthUser";

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
  const user = await getAuthUser();
  const discordId = user?.id;

  if (!discordId || !user?.isAdmin) {
    return (
      <div className="w-fit mx-auto text-3xl text-stability">
        Come back soon!
      </div>
    );
  }

  return (
    <BingoClientWrapper
      endDate={event.end_date}
      teams={event.teams}
      tiles={event.tiles}
      eventId={event.id}
    />
  );
}
