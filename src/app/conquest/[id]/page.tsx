import { Suspense } from "react";
import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getEvent } from "@/lib/fetch/getBingo";
import {
  getConquestTerritories,
  getConquestRegions,
  getEventLogs,
} from "@/lib/fetch/getConquest";
import { ConquestClientWrapper } from "./_components/ConquestClientWrapper";
import type { RegionData } from "@/components/territory-map/types";
import Loading from "./loading";

const CONQUEST_ADMIN_IDS: string[] = [
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
  const [{ id }, session] = await Promise.all([params, auth()]);
  if (!session?.user?.id || !CONQUEST_ADMIN_IDS.includes(session.user.id)) {
    notFound();
  }
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

  const playerCount = event.teams.reduce((sum, t) => sum + t.members.length, 0);

  return (
    <ConquestClientWrapper
      event={event}
      regionData={regionData}
      initialTerritories={initialTerritories}
      initialRegions={initialRegions}
      teams={event.teams}
      initialLogs={logsResponse.data}
      playerCount={playerCount}
    />
  );
}
