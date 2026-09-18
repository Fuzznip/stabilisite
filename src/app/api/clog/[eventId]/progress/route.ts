export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/clog/progress`,
    // The page polls this on a timer, so it must not be served from a cache —
    // a revalidate window here would just cap how fresh the board can ever be.
    { cache: "no-store" },
  );

  if (!res.ok) {
    return new Response("Failed to fetch clog progress", { status: 502 });
  }

  return Response.json(await res.json());
}
