import { Raid, RaidTierResponse } from "../types";

export async function getRaids(): Promise<Raid[]> {
  const raidResposne = await fetch(`${process.env.API_URL}/raidTier`).then(
    (res) => res.json()
  );

  console.log(`${process.env.API_URL}/raidTier`);
  console.log(raidResposne);

  const raids = groupRaidTiers(raidResposne);
  console.log(raids);
  return raids;
}
function groupRaidTiers(data: RaidTierResponse[]): Raid[] {
  const grouped = new Map<string, Raid>();

  for (const item of data) {
    const existing = grouped.get(item.tier_name);

    const tier = {
      id: item.id,
      order: item.tier_order,
      icon: item.tier_icon,
      color: item.tier_color,
      requirements: item.tier_requirements,
      points: item.tier_points,
    };

    if (existing) {
      existing?.tiers.push(tier);
    } else {
      grouped.set(item.tier_name, {
        raidName: item.tier_name,
        tiers: [tier],
      });
    }
  }

  // Sort tiers within each raid by order before returning
  return Array.from(grouped.values()).map((raid) => ({
    ...raid,
    tiers: raid?.tiers.sort((a, b) => a.order - b.order),
  }));
}
