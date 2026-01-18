import { TeamWithMembers, TeamProgressResponse } from "@/lib/types/v2";
import { ProgressHydrator } from "./ProgressHydrator";

type ProgressLoaderProps = {
  teams: TeamWithMembers[];
};

export async function ProgressLoader({ teams }: ProgressLoaderProps) {
  const allTeamProgress = await Promise.all(
    teams.map(async (team) => {
      const progress: TeamProgressResponse = await fetch(
        `${process.env.API_URL}/v2/teams/${team.id}/progress`
      ).then((res) => res.json());
      return { teamId: team.id, progress };
    })
  );

  const progressMap = Object.fromEntries(
    allTeamProgress.map(({ teamId, progress }) => [teamId, progress])
  );

  return <ProgressHydrator progressMap={progressMap} />;
}
