import type {
  DiaryApplication,
  RankApplication,
  RankName,
  Split,
  User,
} from "@/lib/types";

/** The homepage merges three unrelated feeds into one chronological stream.
 *  Normalising them here keeps the sorting, the date fallbacks and the
 *  player lookup out of the rendering code. */

export type ActivityKind = "split" | "diary" | "promotion";

/** Compact relative time — "2h", "5d" — rather than date-fns' "about 2 hours".
 *  A dense feed can't afford the long form. */
export function shortAgo(date: Date, now: Date): string {
  const seconds = Math.max(
    0,
    Math.round((now.getTime() - date.getTime()) / 1000),
  );
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

type Base = { id: string; date: Date };

export type ActivityItem = Base &
  (
    | { kind: "split"; split: Split; playerName?: string }
    | { kind: "diary"; diary: DiaryApplication }
    | { kind: "promotion"; runescapeName: string; rank: RankName }
  );

/** `new Date(undefined)` and `new Date("")` both yield an Invalid Date, which
 *  sorts unpredictably and makes date-fns throw. Anything unparseable is
 *  dropped from the feed rather than rendered as "Invalid Date ago". */
function validDate(value: Date | string | null | undefined): Date | undefined {
  if (value === null || value === undefined) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function usersByDiscordId(
  users: User[] | undefined,
): Map<string, User> {
  const map = new Map<string, User>();
  for (const user of users ?? []) {
    if (user.discordId) map.set(user.discordId, user);
  }
  return map;
}

export function buildActivityFeed(
  {
    splits,
    diaries,
    promotions,
    users,
  }: {
    splits: Split[];
    diaries: DiaryApplication[];
    promotions: RankApplication[];
    users: Map<string, User>;
  },
  limit: number,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const split of splits) {
    const date = validDate(split.date);
    if (!date) continue;
    items.push({
      kind: "split",
      id: `split-${split.id}`,
      date,
      split,
      // splits.user_id is the Discord ID (FK to users.discord_id), so this
      // resolves against the same map the member count is built from.
      playerName: users.get(split.userId)?.runescapeName,
    });
  }

  for (const diary of diaries) {
    const date = validDate(diary.date);
    if (!date || !diary.id) continue;
    items.push({ kind: "diary", id: `diary-${diary.id}`, date, diary });
  }

  for (const promotion of promotions) {
    // The rank a member came *from* isn't stored on the application, so a
    // promotion row can only say where they landed.
    if (promotion.status !== "Accepted") continue;
    if (!promotion.id || !promotion.runescapeName || !promotion.rank) continue;
    // Prefer when the promotion was granted; fall back to when it was asked
    // for, for older rows that predate verdict timestamps.
    const date = validDate(promotion.verdictDate) ?? validDate(promotion.date);
    if (!date) continue;
    items.push({
      kind: "promotion",
      id: `promotion-${promotion.id}`,
      date,
      runescapeName: promotion.runescapeName,
      rank: promotion.rank as RankName,
    });
  }

  return items
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
