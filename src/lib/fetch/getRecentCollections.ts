import { CollectionLogEvent } from "@/lib/types";
import { PaginatedResponse } from "./getSplits";

type RecentResponse = {
  id: string;
  runescape_name: string;
  item_id: number;
  item_name: string;
  obtained_at: string;
};

/** Chosen so a full page renders without the list needing to scroll. */
export const RECENT_PER_PAGE = 6;

const EMPTY: PaginatedResponse<CollectionLogEvent> = {
  items: [],
  page: 1,
  per_page: RECENT_PER_PAGE,
  total: 0,
  pages: 0,
  has_next: false,
  has_prev: false,
};

/**
 * Collection log items the clan has obtained most recently, newest first.
 *
 * Expects GET /collection-log/recent?page=&per_page= to return the same
 * paginated envelope the other list endpoints use, with items shaped like
 * RecentResponse above. Returns an empty page if the endpoint is unavailable,
 * so the panel renders an empty state rather than breaking the log.
 */
export async function getRecentCollections(
  page: number,
  perPage: number = RECENT_PER_PAGE
): Promise<PaginatedResponse<CollectionLogEvent>> {
  try {
    const response = await fetch(
      `${process.env.API_URL}/collection-log/recent?page=${page}&per_page=${perPage}`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) return EMPTY;

    const data = await response.json();
    const rows: RecentResponse[] = Array.isArray(data?.items) ? data.items : [];

    return {
      items: rows.map((row) => ({
        id: row.id,
        runescapeName: row.runescape_name,
        itemId: row.item_id,
        itemName: row.item_name,
        obtainedAt: row.obtained_at,
      })),
      page: data.page ?? page,
      per_page: data.per_page ?? perPage,
      total: data.total ?? rows.length,
      pages: data.pages ?? 1,
      has_next: data.has_next ?? false,
      has_prev: data.has_prev ?? false,
    };
  } catch {
    return EMPTY;
  }
}
