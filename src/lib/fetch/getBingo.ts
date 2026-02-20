import {
  Event,
  EventWithDetails,
  TileProgressResponse,
  TileWithTasks,
} from "../types/v2";

export async function getEvents(): Promise<Event[]> {
  const res = await fetch(`${process.env.API_URL}/v2/events`, {
    next: { tags: ["bingo-event"] },
  });
  const json = await res.json();
  return json.data;
}

export async function getActiveEvent(): Promise<EventWithDetails | undefined> {
  const res = await fetch(`${process.env.API_URL}/v2/events/active`, {
    next: { tags: ["bingo-event"] },
  });
  const json = res.json();
  return res.status === 200 ? json : undefined;
}

export async function getReleasedEvent(): Promise<Event | undefined> {
  const events = await getEvents();
  const now = new Date();
  return events.find(
    (e) => now >= new Date(e.release_date) && now < new Date(e.end_date),
  );
}

export async function getEvent(id: string): Promise<EventWithDetails> {
  const res = await fetch(`${process.env.API_URL}/v2/events/${id}`, {
    next: { tags: ["bingo-event"] },
  });
  return res.json();
}

export async function getTile(tileId: string): Promise<TileWithTasks> {
  const res = await fetch(`${process.env.API_URL}/v2/tiles/${tileId}`, {
    next: { tags: [`tile-${tileId}`] },
  });
  return res.json();
}

export async function getTileProgress(
  tileId: string,
): Promise<TileProgressResponse> {
  const res = await fetch(
    `${process.env.API_URL}/v2/tiles/${tileId}/progress`,
    {
      next: { tags: ["bingo-progress", `tile-progress-${tileId}`] },
    },
  );
  return res.json();
}
