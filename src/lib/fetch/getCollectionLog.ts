import { CollectionLogCategory, CollectionLogSummary } from "@/lib/types";
import catalog from "@/lib/data/collectionLogCatalog.json";

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
 * The tab/page/item structure comes from collectionLogCatalog.json, which
 * scripts/cache/extract.sh reads straight out of the game cache — so the pages
 * and their item order match the in-game log exactly. Only the obtained counts
 * are dynamic, so that's all we ask the API for.
 */
export async function getCollectionLog(): Promise<CollectionLogData> {
  const categories = catalog as CollectionLogCategory[];

  const summary: CollectionLogSummary = {};
  try {
    const response = await fetch(`${process.env.API_URL}/collection-log/summary`, {
      // Obtained counts change as drops arrive.
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const rows: SummaryResponse = await response.json();
      for (const row of rows) {
        summary[row.item_id] = {
          memberCount: row.member_count,
          totalCount: row.total_count,
        };
      }
    }
  } catch {
    // The log still renders with nothing obtained if the API is unreachable.
  }

  return { categories, summary };
}
