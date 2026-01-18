import { TileProgressResponse } from "@/lib/types/v2";
import { TileProgressHydrator } from "./TileProgressHydrator";

export async function TileProgressLoader({ tileId }: { tileId: string }) {
  const progressResponse: TileProgressResponse = await fetch(
    `${process.env.API_URL}/v2/tiles/${tileId}/progress`,
    { next: { revalidate: 1 } }
  ).then((res) => res.json());

  return <TileProgressHydrator teamProgresses={progressResponse.teams} />;
}
