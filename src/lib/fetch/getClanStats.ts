import type { SplitResponse } from "../types";

/**
 * Total value of loot the clan has split — summed `item_price`, not the
 * per-member contribution.
 *
 * `/splits` with no `page` param returns the entire table, which is the only
 * way to get a clan-wide sum: the backend exposes no aggregate endpoint.
 *
 * That makes this the most expensive call on the homepage, so it is cached
 * for 15 minutes. The consequence: a brand new split shows up in the activity
 * feed (fetched fresh) before this figure moves. That lag is deliberate —
 * recomputing a full-table sum on every homepage render is not worth a
 * real-time counter.
 */
export async function getTotalSplitValue(): Promise<number> {
  const response = await fetch(`${process.env.API_URL}/splits`, {
    next: { revalidate: 900 },
  });
  if (!response.ok) return 0;

  const splits: SplitResponse[] = await response.json();
  return splits.reduce(
    (total, split) => total + (Number(split.item_price) || 0),
    0,
  );
}
