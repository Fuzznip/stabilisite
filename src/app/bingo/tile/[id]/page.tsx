import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { TilePage } from "./TilePage";
import { TileProgressResponse, TileWithTasks } from "@/lib/types/v2";

async function getTile(tileId: string): Promise<TileWithTasks> {
  return fetch(`${process.env.API_URL}/v2/tiles/${tileId}`, {
    next: { tags: [`tile-${tileId}`] },
  }).then((res) => res.json());
}

async function getTileProgress(tileId: string): Promise<TileProgressResponse> {
  return fetch(`${process.env.API_URL}/v2/tiles/${tileId}/progress`, {
    next: { tags: ["bingo-progress", `tile-progress-${tileId}`] },
  }).then((res) => res.json());
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tileId = (await params).id;
  const user = await getAuthUser();

  if (!user?.isAdmin) {
    return (
      <div className="w-fit mx-auto text-3xl text-stability">
        Come back soon!
      </div>
    );
  }

  const [tile, progress] = await Promise.all([
    getTile(tileId),
    getTileProgress(tileId),
  ]);

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center">
      <TilePage tile={tile} teamProgresses={progress.teams} />
    </div>
  );
}
