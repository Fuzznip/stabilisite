import { Suspense } from "react";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { TilePage } from "./TilePage";
import { TileWithTasks } from "@/lib/types/v2";
import { TileProgressProvider } from "./TileProgressContext";
import { TileProgressLoader } from "./TileProgressLoader";

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

  // Fetch tile details with caching
  const tile: TileWithTasks = await fetch(
    `${process.env.API_URL}/v2/tiles/${tileId}`,
    { next: { revalidate: 1 } }
  ).then((res) => res.json());

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center">
      <TileProgressProvider>
        <TilePage tile={tile}>
          <Suspense fallback={null}>
            <TileProgressLoader tileId={tileId} />
          </Suspense>
        </TilePage>
      </TileProgressProvider>
    </div>
  );
}
