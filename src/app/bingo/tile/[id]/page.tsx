import { Suspense } from "react";
import { TilePageWrapper } from "./TilePage";
import {
  EventWithDetails,
  TileProgressResponse,
  TileWithTasks,
} from "@/lib/types/v2";
import { auth } from "@/auth";
import Loading from "./loading";
import { TileProgressHydrator } from "./TileProgressHydrator";
import { RecentDropsProvider } from "../../_components/RecentDropsStore";
import DropToaster from "../../_components/DropToaster";

export const runtime = "edge";

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
  const start = Date.now();
  const res = await fetch(`${process.env.API_URL}/v2/tiles/${tileId}`, {
    next: { tags: [`tile-${tileId}`] },
  });
  const data = await res.json();
  console.log(`[getTile] ${tileId}: ${Date.now() - start}ms`);
  return data;
}

async function getTileProgress(tileId: string): Promise<TileProgressResponse> {
  const start = Date.now();
  const res = await fetch(`${process.env.API_URL}/v2/tiles/${tileId}/progress`, {
    next: { tags: ["bingo-progress", `tile-progress-${tileId}`] },
  });
  const data = await res.json();
  console.log(`[getTileProgress] ${tileId}: ${Date.now() - start}ms`);
  return data;
}

async function getActiveEvent(): Promise<EventWithDetails> {
  const start = Date.now();
  const res = await fetch(`${process.env.API_URL}/v2/events/active`, {
    next: { tags: ["bingo-event"] },
  });
  const data = await res.json();
  console.log(`[getActiveEvent]: ${Date.now() - start}ms`);
  return data;
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

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center">
      <Suspense fallback={<Loading />}>
        <TileContent tileId={tileId} />
      </Suspense>
    </div>
  );
}

async function TileContent({ tileId }: { tileId: string }) {
  const [tile, event] = await Promise.all([getTile(tileId), getActiveEvent()]);

  return (
    <RecentDropsProvider>
      <TilePageWrapper tile={tile}>
        <Suspense fallback={null}>
          <ProgressContent tileId={tileId} />
        </Suspense>
      </TilePageWrapper>
      <DropToaster teams={event.teams} />
    </RecentDropsProvider>
  );
}

async function ProgressContent({ tileId }: { tileId: string }) {
  const progress = await getTileProgress(tileId);
  return <TileProgressHydrator teamProgresses={progress.teams} />;
}
