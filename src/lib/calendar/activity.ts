import { buildActivityFeed, type ActivityItem } from "@/lib/activity";
import type { RankApplication, RankName, Split, User } from "@/lib/types";
import { rank_colors } from "@/lib/utils";
import { utcToEt } from "./time";

/** A split or promotion, pinned to the day it happened. */
export type CalendarActivity = Extract<ActivityItem, { kind: "split" | "promotion" }>;

const isCalendarActivity = (item: ActivityItem): item is CalendarActivity =>
  item.kind === "split" || item.kind === "promotion";

/** Reuses the home feed's normalising, so the calendar agrees with it on which
 *  promotions count, which date they get, and who a split belongs to. */
export function buildCalendarActivity({
  splits,
  promotions,
  users,
}: {
  splits: Split[];
  promotions: RankApplication[];
  users: Map<string, User>;
}): CalendarActivity[] {
  const activity = buildActivityFeed({ splits, diaries: [], promotions, users }, Infinity).filter(
    isCalendarActivity,
  );
  return highestPromotionPerDay(activity);
}

/** rank_colors runs lowest to highest. */
const rankOrder = (rank: RankName) => rank_colors.findIndex((entry) => entry.name === rank);

/** A player promoted several times in one day shows only where they ended up. */
function highestPromotionPerDay(activity: CalendarActivity[]): CalendarActivity[] {
  const best = new Map<string, CalendarActivity & { kind: "promotion" }>();
  for (const item of activity) {
    if (item.kind !== "promotion") continue;
    const key = `${utcToEt(item.date).date}|${item.runescapeName.toLowerCase()}`;
    const current = best.get(key);
    if (!current || rankOrder(item.rank) > rankOrder(current.rank)) best.set(key, item);
  }
  const kept = new Set<CalendarActivity>(best.values());
  return activity.filter((item) => item.kind !== "promotion" || kept.has(item));
}

/** Groups by ET day, ordered for a crowded cell: promotions first, then the
 *  biggest splits, so the ones worth a glance survive the cut. */
export function activityByDay(activity: CalendarActivity[]): Map<string, CalendarActivity[]> {
  const days = new Map<string, CalendarActivity[]>();
  for (const item of activity) {
    const day = utcToEt(item.date).date;
    days.set(day, [...(days.get(day) ?? []), item]);
  }
  for (const items of days.values()) items.sort(byProminence);
  return days;
}

function byProminence(a: CalendarActivity, b: CalendarActivity): number {
  if (a.kind !== b.kind) return a.kind === "promotion" ? -1 : 1;
  if (a.kind === "split" && b.kind === "split") return b.split.itemPrice - a.split.itemPrice;
  return +a.date - +b.date;
}
