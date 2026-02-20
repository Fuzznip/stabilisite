import { Suspense } from "react";
import { Metadata } from "next";
import { TilePageWrapper } from "./TilePage";
import Loading from "./loading";
import { TileProgressHydrator } from "./TileProgressHydrator";
import { getEvent, getTile, getTileProgress } from "@/lib/fetch/getBingo";
import DropToaster from "../../_components/DropToaster";
import { RecentDropsProvider } from "../../_components/RecentDropsStore";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; tileId: string }>;
}): Promise<Metadata> {
  const { id, tileId } = await params;
  const [tile, event] = await Promise.all([getTile(tileId), getEvent(id)]);
  return {
    title: tile.name,
    description: `The ${tile.name} tile for the Stability clan event ${event.name}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; tileId: string }>;
}) {
  const { id, tileId } = await params;

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center">
      <Suspense fallback={<Loading />}>
        <TileContent eventId={id} tileId={tileId} />
      </Suspense>
    </div>
  );
}

async function TileContent({
  eventId,
  tileId,
}: {
  eventId: string;
  tileId: string;
}) {
  const [tile, event] = await Promise.all([getTile(tileId), getEvent(eventId)]);

  return (
    <RecentDropsProvider eventId={event.id}>
      <TilePageWrapper tile={tile}>
        <Suspense fallback={null}>
          <ProgressContent tileId={tileId} />
        </Suspense>
      </TilePageWrapper>
      <DropToaster teams={event.teams} eventId={event.id} />
    </RecentDropsProvider>
  );
}

async function ProgressContent({ tileId }: { tileId: string }) {
  const progress = await getTileProgress(tileId);
  return <TileProgressHydrator teamProgresses={progress.teams} />;
}
