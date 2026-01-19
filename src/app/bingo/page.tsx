import { EventWithDetails, TeamProgressResponse } from "@/lib/types/v2";
import { BingoClientWrapper } from "./_components/BingoClientWrapper";

export const dynamic = "force-static";

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

export default async function HomePage() {
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
      progressMap={progressMap}
    />
  );
}
