"use server";

import { CollectionLogMember } from "@/lib/types";

type ItemMembersResponse = {
  discord_id: string;
  runescape_name: string;
  discord_avatar_url?: string;
  rank: string;
  count: number;
  first_obtained: string | null;
  last_obtained: string | null;
  drops?: {
    id: string;
    screenshot: string | null;
    source: string | null;
    obtained_at: string | null;
  }[];
}[];

export async function getItemMembers(
  itemId: number
): Promise<CollectionLogMember[]> {
  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/collection-log/item/${itemId}`, {
      cache: "no-store",
    });
  } catch {
    // An unreachable API shows as "nobody has this" rather than a stuck dialog.
    return [];
  }
  if (!res.ok) return [];

  const data: ItemMembersResponse = await res.json();
  return data.map((member) => ({
    discordId: member.discord_id,
    runescapeName: member.runescape_name,
    discordImg: member.discord_avatar_url,
    rank: member.rank,
    count: member.count,
    firstObtained: member.first_obtained,
    lastObtained: member.last_obtained,
    drops: (member.drops ?? []).map((drop) => ({
      id: drop.id,
      screenshot: drop.screenshot,
      source: drop.source,
      obtainedAt: drop.obtained_at,
    })),
  }));
}
