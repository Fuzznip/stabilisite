import { EventWithDetails, TeamProgressResponse } from "@/lib/types/v2";
import { BingoClientWrapper } from "./_components/BingoClientWrapper";
import { getAuthUser } from "@/lib/fetch/getAuthUser";

async function getActiveEvent(): Promise<EventWithDetails> {
  return fetch(`${process.env.API_URL}/v2/events/active`, {
    next: { tags: ["bingo-event"] },
  }).then((res) => res.json());
}

async function getTeamProgress(teamId: string): Promise<TeamProgressResponse> {
  return fetch(`${process.env.API_URL}/v2/teams/${teamId}/progress`, {
    next: { tags: ["bingo-progress", `team-progress-${teamId}`] },
  }).then((res) => res.json());
}

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
  const event = await getActiveEvent();

  // Fetch all team progress in parallel
  const allTeamProgress = await Promise.all(
    event.teams.map(async (team) => {
      const progress = await getTeamProgress(team.id);
      return { teamId: team.id, progress };
    }),
  );

  const progressMap = Object.fromEntries(
    allTeamProgress.map(({ teamId, progress }) => [teamId, progress]),
  );

  return (
    <BingoClientWrapper
      endDate={event.end_date}
      teams={event.teams}
      tiles={event.tiles}
      initialTeamId={teamId}
      progressMap={progressMap}
    />
  );
}
