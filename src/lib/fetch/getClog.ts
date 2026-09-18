import type { ClogProgress, ClogSlot } from "@/lib/types/v2";

/**
 * The slot list only changes when an admin prunes one, so it is cached for an
 * hour. Progress moves with every drop and is never cached.
 */
export async function getClogSlots(eventId: string): Promise<ClogSlot[]> {
  const response = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/clog/slots`,
    { next: { revalidate: 3600, tags: ["clog-slots"] } },
  );
  if (!response.ok) return [];
  const payload = (await response.json()) as { data: ClogSlot[] };
  return payload.data ?? [];
}

export async function getClogProgress(eventId: string): Promise<ClogProgress> {
  const response = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/clog/progress`,
    { cache: "no-store" },
  );
  if (!response.ok) return { standings: [], completed: {} };
  return (await response.json()) as ClogProgress;
}
