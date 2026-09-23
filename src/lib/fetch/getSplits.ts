import { Split, SplitResponse, User } from "../types";

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
};

function mapSplit(split: SplitResponse): Split {
  return {
    id: split.id,
    userId: split.user_id,
    itemId: split.item_id,
    itemName: split.item_name,
    itemPrice: Number(split.item_price),
    itemImg: `https://oldschool.runescape.wiki/images/${encodeURIComponent(
      split.item_name.replace(/ /g, "_"),
    )}.png`,
    splitContribution: Number(split.split_contribution),
    groupSize: Number(split.group_size),
    screenshotLink: split.screenshot_link,
    date: new Date(split.timestamp),
  };
}

/**
 * The biggest splits from the last `days` days, largest first.
 *
 * Uses the endpoint's `begin_date` filter rather than sorting the whole
 * table client-side: the window is a few dozen rows, not thousands. Omitting
 * `page` makes the endpoint return every match in the window, so the sort
 * below sees all of them and not just the first page.
 */
export async function getTopRecentSplits(
  days: number,
  limit: number,
): Promise<Split[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const beginDate = since.toISOString().slice(0, 10);

  const response = await fetch(
    `${process.env.API_URL}/splits?begin_date=${beginDate}`,
    { next: { revalidate: 300 } },
  );
  if (!response.ok) return [];

  const splits: SplitResponse[] = await response.json();
  return splits
    .map(mapSplit)
    .sort((a, b) => b.itemPrice - a.itemPrice)
    .slice(0, limit);
}

export async function getSplits(user?: User | null): Promise<Split[]> {
  const endpoint = user ? `users/${user.discordId}/splits` : "splits";
  return fetch(`${process.env.API_URL}/${endpoint}`)
    .then((response) => response.json())
    .then((splits) =>
      splits
        .map(mapSplit)
        .sort((a: Split, b: Split) => b.date.getTime() - a.date.getTime()),
    );
}

export async function getSplitsPaginated(
  page: number,
  perPage: number = 10,
): Promise<PaginatedResponse<Split>> {
  const response = await fetch(
    `${process.env.API_URL}/splits?page=${page}&per_page=${perPage}`,
  );
  const data = await response.json();

  return {
    items: data.items.map(mapSplit),
    page: data.page,
    per_page: data.per_page,
    total: data.total,
    pages: data.pages,
    has_next: data.has_next,
    has_prev: data.has_prev,
  };
}
