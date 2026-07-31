import { getCollectionLog } from "@/lib/fetch/getCollectionLog";
import { getRecentCollections } from "@/lib/fetch/getRecentCollections";
import { CollectionLog } from "./_components/CollectionLog";
import { RecentCollections } from "./_components/RecentCollections";

export default async function CollectionLogPage(): Promise<React.ReactElement> {
  const [{ categories, summary }, recent] = await Promise.all([
    getCollectionLog(),
    getRecentCollections(1),
  ]);

  return (
    <div className="flex w-full h-full flex-col gap-4">
      <CollectionLog categories={categories} summary={summary} />
      <RecentCollections initial={recent} />
    </div>
  );
}
