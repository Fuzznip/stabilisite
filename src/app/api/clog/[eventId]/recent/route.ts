export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const incoming = new URL(request.url).searchParams;

  // Forward only what the endpoint understands, so a crafted query string
  // cannot reach the backend untouched.
  const query = new URLSearchParams();
  for (const key of ["page", "per_page", "team_id"]) {
    const value = incoming.get(key);
    if (value) query.set(key, value);
  }

  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/clog/recent?${query}`,
    // Shared across viewers, and the feed only moves when someone lands a drop.
    { next: { revalidate: 10 } },
  );

  if (!res.ok) {
    return new Response("Failed to fetch clog activity", { status: 502 });
  }

  return Response.json(await res.json());
}
