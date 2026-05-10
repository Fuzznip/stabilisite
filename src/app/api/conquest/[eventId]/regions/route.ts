export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/regions`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return new Response("Failed to fetch regions", { status: 502 });
  }

  const json = await res.json();
  return Response.json(json);
}
