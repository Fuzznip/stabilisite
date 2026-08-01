import { CollectionLogCategory, CollectionLogSummary } from "@/lib/types";

type CatalogResponse = {
  category: string;
  pages: {
    page: string;
    items: { item_id: number; name: string }[];
  }[];
}[];

type SummaryResponse = {
  item_id: number;
  member_count: number;
  total_count: number;
}[];

export type CollectionLogData = {
  categories: CollectionLogCategory[];
  summary: CollectionLogSummary;
};

/**
 * The catalog lives in the database (collection_log_items), seeded from the
 * game cache by the sibling repo's scripts/cache/extract.sh. Reading it from
 * the API rather than a checked-in file keeps one source of truth: the same
 * rows drive this page and the /collection-log/items filter stabiliserver uses
 * to decide which drops are collection log items.
 *
 * The catalog only changes when the game does, so it's cached for a day; the
 * obtained counts move as drops arrive and refresh far more often.
 */
export async function getCollectionLog(): Promise<CollectionLogData> {
  const [catalog, summaryRows] = await Promise.all([
    fetchJson<CatalogResponse>("/collection-log/catalog", 86400, []),
    fetchJson<SummaryResponse>("/collection-log/summary", 60, []),
  ]);

  const categories: CollectionLogCategory[] = catalog.map((cat) => ({
    category: cat.category,
    pages: cat.pages.map((page) => ({
      page: page.page,
      items: page.items.map((item) => ({
        itemId: item.item_id,
        name: item.name,
      })),
    })),
  }));

  const summary: CollectionLogSummary = {};
  for (const row of summaryRows) {
    summary[row.item_id] = {
      memberCount: row.member_count,
      totalCount: row.total_count,
    };
  }

  return { categories, summary };
}

/** An unreachable API renders an empty log rather than throwing the page away. */
async function fetchJson<T>(
  path: string,
  revalidate: number,
  fallback: T
): Promise<T> {
  try {
    const response = await fetch(`${process.env.API_URL}${path}`, {
      next: { revalidate },
    });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
