import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { TilePage } from "./TilePage";
import { TileProgressResponse, TileWithTasks } from "@/lib/types/v2";

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

  // Fetch tile details with tasks
  const tile: TileWithTasks = await fetch(
    `${process.env.API_URL}/v2/tiles/${tileId}`
  ).then((res) => res.json());

  // Fetch progress for all teams on this tile
  const progressResponse: TileProgressResponse = await fetch(
    `${process.env.API_URL}/v2/tiles/${tileId}/progress`
  ).then((res) => res.json());

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center">
      <TilePage tile={tile} teamProgresses={progressResponse.teams} />
    </div>
  );
}
