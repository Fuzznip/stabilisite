import { getCollectionLog } from "@/lib/fetch/getCollectionLog";
import { getRecentCollections } from "@/lib/fetch/getRecentCollections";
import { CollectionLog } from "./_components/CollectionLog";
import { RecentCollections } from "./_components/RecentCollections";

export default async function CollectionLogPage(): Promise<React.ReactElement> {
  const [{ categories, summary }, recent] = await Promise.all([
    getCollectionLog(),
    getRecentCollections(1),
  ]);

  // The catalog comes from the API now, so an outage means there is no log to
  // draw at all — say so rather than rendering an empty frame.
  if (!categories.length) {
    return (
      <p className="text-muted-foreground">
        The collection log is not available right now.
      </p>
    );
  }

  return (
    <div className="flex w-full h-full flex-col gap-4">
      <CollectionLog categories={categories} summary={summary} />
      <RecentCollections initial={recent} />
    </div>
  );
}
