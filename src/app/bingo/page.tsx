import { EventWithDetails, TeamProgressResponse } from "@/lib/types/v2";
import { BingoClientWrapper } from "./_components/BingoClientWrapper";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string }>;
}) {
  const { teamId } = await searchParams;
  const event: EventWithDetails = await fetch(
    `${process.env.API_URL}/v2/events/active`
  ).then((res) => res.json());

  // Fetch progress for ALL teams upfront
  const allTeamProgress = await Promise.all(
    event.teams.map(async (team) => {
      const progress: TeamProgressResponse = await fetch(
        `${process.env.API_URL}/v2/teams/${team.id}/progress`
      ).then((res) => res.json());
      return { teamId: team.id, progress };
    })
  );

  const progressMap = Object.fromEntries(
    allTeamProgress.map(({ teamId, progress }) => [teamId, progress])
  );

  return (
    <BingoClientWrapper
      teams={event.teams}
      tiles={event.tiles}
      progressMap={progressMap}
      initialTeamId={teamId}
    />
  );
}
