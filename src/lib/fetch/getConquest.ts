import type { ConquestRegion, ConquestTerritory, EventLog } from "@/lib/types/v2";

export async function getConquestRegions(
  eventId: string
): Promise<ConquestRegion[]> {
  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/regions`,
    { next: { tags: [`conquest-regions-${eventId}`] } }
  );
  const json = await res.json();
  return json.data;
}

export async function getConquestTerritories(
  eventId: string
): Promise<ConquestTerritory[]> {
  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/territories`,
    { next: { tags: [`conquest-territories-${eventId}`] } }
  );
  const json = await res.json();
  return json.data;
}

export async function getEventLogs(
  eventId: string,
  page = 1,
  perPage = 50
): Promise<{ data: EventLog[]; total: number; page: number; per_page: number }> {
  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/event-logs?page=${page}&per_page=${perPage}`,
    { next: { tags: [`conquest-logs-${eventId}`] } }
  );
  return res.json();
}
