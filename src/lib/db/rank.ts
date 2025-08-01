import {
  RankApplication,
  RankApplicationResponse,
  RankForm,
  User,
} from "../types";

export async function submitRankForm(
  user: User | null,
  rankForm: RankForm
): Promise<void> {
  const rankRequest = {
    user_id: user?.discordId,
    rank: rankForm.rank,
    rank_order: rankForm.rankOrder,
    proof: rankForm.proof,
  };
  const response = await fetch(`${process.env.API_URL}/applications/rank`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rankRequest),
  });
  if (!response.ok) throw await response.text();
  return;
}

export async function getRankApplications(
  user?: User | undefined
): Promise<RankApplication[]> {
  const rankApplicationResponse = await fetch(
    `${process.env.API_URL}/applications/rank`
  ).then((res) => res.json());

  const applications: RankApplication[] = rankApplicationResponse.map(
    (application: RankApplicationResponse) => ({
      id: application.id,
      proof: application.proof,
      runescapeName: application.runescape_name,
      status: application.status,
      rank: application.desired_rank,
      date: new Date(application.timestamp),
      userId: application.user_id,
      verdictReason: application.verdict_reason,
      verdictDate: new Date(application.verdict_timestamp || ""),
    })
  );

  if (user) {
    return applications.filter(
      (application) =>
        application.status === "Accepted" &&
        application.runescapeName === user.runescapeName
    );
  }
  return applications;
}
