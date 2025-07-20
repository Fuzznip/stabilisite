import { Rank, RankResponse } from "../types";

export async function getRanks(): Promise<Rank[]> {
  const rankResponse = await fetch(`${process.env.API_URL}/ranks`).then((res) =>
    res.json()
  );

  return rankResponse.map((rank: RankResponse) => ({
    id: rank.id,
    rankName: rank.rank_name,
    rankMinimumPoints: rank.rank_minimum_points,
    rankMinimumDays: rank.rank_minimum_days,
    rankOrder: rank.rank_order,
    rankIcon: rank.rank_icon,
    rankColor: rank.rank_color,
    rankDescription: rank.rank_description,
    rankRequirements: rank.rank_requirements,
  }));
}
