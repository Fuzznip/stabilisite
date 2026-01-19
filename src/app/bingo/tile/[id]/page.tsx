import { TilePage } from "./TilePage";
import { TileProgressResponse, TileWithTasks } from "@/lib/types/v2";
import { auth } from "@/auth";

// Temporary allowed Discord IDs for bingo
const ALLOWED_BINGO_DISCORD_IDS = [
  "156543787882119168", // Tboodle
  "88087113626587136", // Funzip
  "298216403666993155", // SuperShane
  "646445353356361728", // CurrvyRabbit
  "144607395459366912", // Gl0bl
  "120691356925427712", // CrazyMuppets
  "104680242672566272", // IronIcedteee
  "334409893685624833", // SilentDDeath
  "347948542049910794", // SoccerTheNub
  "198296669253664768", // Xbrennyx
];

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
  const session = await auth();
  const discordId = session?.user?.id;

  if (!discordId || !ALLOWED_BINGO_DISCORD_IDS.includes(discordId)) {
    return (
      <div className="w-fit mx-auto text-3xl text-stability">
        Come back soon!
      </div>
    );
  }

  const tileId = (await params).id;

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
