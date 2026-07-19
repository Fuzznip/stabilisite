export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/scoreboard`,
    // Shared across all viewers; at most one upstream fetch per 10s.
    { next: { revalidate: 10 } }
  );

  if (!res.ok) {
    return new Response("Failed to fetch teams", { status: 502 });
  }

  const json = await res.json();
  return Response.json({ data: json.data ?? [] });
}
