import type { BotwBoss, BotwLeaderboardEntry } from "@/lib/types/v2";

/**
 * Fills in the per-boss breakdown the UI renders.
 *
 * `kills` and `drops` were added to the leaderboard after the first release, so
 * a backend that hasn't been redeployed still answers with the old shape. The
 * page shouldn't crash on that — it should just render fewer tiles.
 */
export function normalizeLeaderboard(
  entries: unknown,
): BotwLeaderboardEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => ({
    ...entry,
    bosses: (entry?.bosses ?? []).map(
      (boss: Partial<BotwLeaderboardEntry["bosses"][number]>) => ({
        ...boss,
        image_url: boss?.image_url ?? null,
        kills: boss?.kills ?? 0,
        drops: boss?.drops ?? [],
      }),
    ),
  })) as BotwLeaderboardEntry[];
}

async function safeJson(res: Response) {
  if (!res.ok) {
    throw new Error(`API error ${res.status} ${res.url}`);
  }
  return res.json();
}

export async function getBotwBosses(eventId: string): Promise<BotwBoss[]> {
  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/botw/bosses`,
    { next: { tags: [`botw-bosses-${eventId}`] } },
  );
  const json = await safeJson(res);
  return json.data ?? [];
}

export async function getBotwLeaderboard(
  eventId: string,
): Promise<BotwLeaderboardEntry[]> {
  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/botw/leaderboard`,
    { next: { tags: [`botw-leaderboard-${eventId}`] } },
  );
  const json = await safeJson(res);
  return normalizeLeaderboard(json.data);
}
