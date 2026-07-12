import { Suspense } from "react";
import { readFile } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { getEvent } from "@/lib/fetch/getBingo";
import {
  getConquestTerritories,
  getConquestRegions,
  getEventLogs,
} from "@/lib/fetch/getConquest";
import { ConquestClientWrapper } from "./_components/ConquestClientWrapper";
import type { RegionData } from "@/components/territory-map/types";
import Loading from "./loading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  return {
    title: event.name,
    description: `Stability Conquest — ${new Date(event.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} to ${new Date(event.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
  };
}

export default async function ConquestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<Loading />}>
      <ConquestContent id={id} />
    </Suspense>
  );
}

async function ConquestContent({ id }: { id: string }) {
  const [event, initialTerritories, initialRegions, regionData, logsResponse] =
    await Promise.all([
      getEvent(id),
      getConquestTerritories(id),
      getConquestRegions(id),
      readFile(
        path.join(process.cwd(), "public", "map", "territories.json"),
        "utf8",
      ).then((raw) => JSON.parse(raw) as RegionData[]),
      getEventLogs(id, 1, 10),
    ]);

  const playerCount =
    event.teams?.reduce((sum, t) => sum + t.members?.length || 0, 0) || 0;

  return (
    <ConquestClientWrapper
      event={event}
      regionData={regionData}
      initialTerritories={initialTerritories}
      initialRegions={initialRegions}
      teams={event.teams ?? []}
      initialLogs={logsResponse.data}
      playerCount={playerCount}
    />
  );
}
