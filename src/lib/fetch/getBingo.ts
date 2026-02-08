import {
  EventWithDetails,
  TileProgressResponse,
  TileWithTasks,
} from "../types/v2";

export async function getActiveEvent(): Promise<EventWithDetails> {
  const res = await fetch(`${process.env.API_URL}/v2/events/active`, {
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
  tileId: string
): Promise<TileProgressResponse> {
  const res = await fetch(
    `${process.env.API_URL}/v2/tiles/${tileId}/progress`,
    {
      next: { tags: ["bingo-progress", `tile-progress-${tileId}`] },
    }
  );
  return res.json();
}
