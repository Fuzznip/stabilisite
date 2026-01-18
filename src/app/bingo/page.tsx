import { Suspense } from "react";
import { EventWithDetails } from "@/lib/types/v2";
import { BingoClientWrapper } from "./_components/BingoClientWrapper";
import { ProgressLoader } from "./_components/ProgressLoader";
import { getAuthUser } from "@/lib/fetch/getAuthUser";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string }>;
}) {
  const user = await getAuthUser();

  if (!user?.isAdmin) {
    return (
      <div className="w-fit mx-auto text-3xl text-stability">
        Come back soon!
      </div>
    );
  }

  const { teamId } = await searchParams;
  const event: EventWithDetails = await fetch(
    `${process.env.API_URL}/v2/events/active`,
    {
      next: { revalidate: 1 }, // Cache and revalidate in background after 1 second
    }
  ).then((res) => res.json());

  // Render the board immediately with tiles, stream in progress data via Suspense
  return (
    <BingoClientWrapper
      endDate={event.end_date}
      teams={event.teams}
      tiles={event.tiles}
      initialTeamId={teamId}
    >
      <Suspense fallback={null}>
        <ProgressLoader teams={event.teams} />
      </Suspense>
    </BingoClientWrapper>
  );
}
