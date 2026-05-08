import { Suspense } from "react";
import { readFile } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { getEvent } from "@/lib/fetch/getBingo";
import { getConquestTerritories, getConquestRegions } from "@/lib/fetch/getConquest";
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
  const [event, initialTerritories, initialRegions, regionData] = await Promise.all([
    getEvent(id),
    getConquestTerritories(id),
    getConquestRegions(id),
    readFile(
      path.join(process.cwd(), "public", "map", "territories.json"),
      "utf8"
    ).then((raw) => JSON.parse(raw) as RegionData[]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center text-3xl font-bold tracking-[0.12em] uppercase text-foreground [font-family:var(--font-cinzel)]">
        {event.name}
      </h1>
      <ConquestClientWrapper
        eventId={id}
        regionData={regionData}
        initialTerritories={initialTerritories}
        initialRegions={initialRegions}
        teams={event.teams}
      />
    </div>
  );
}
