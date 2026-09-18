export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/clog/players`,
    // Shared across all viewers; at most one upstream fetch per 10s. The roster
    // only moves when someone lands a drop, so a few seconds stale is fine.
    { next: { revalidate: 10 } },
  );

  if (!res.ok) {
    return new Response("Failed to fetch clog players", { status: 502 });
  }

  const json = await res.json();
  return Response.json(json.data ?? json);
}
