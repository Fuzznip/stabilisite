import type { CalendarEntry } from "../types/calendar";

/** Every entry overlapping [from, to), private ones included — callers filter
 *  with buildCalendarItems before anything reaches the client. */
export async function getCalendarEntries(from: Date, to: Date): Promise<CalendarEntry[]> {
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
    include_private: "true",
  });
  const res = await fetch(`${process.env.API_URL}/v2/calendar?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET /v2/calendar failed: ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
}
