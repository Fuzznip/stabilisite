export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const perPage = searchParams.get("per_page") ?? "100";

  const res = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/event-logs?per_page=${perPage}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return new Response("Failed to fetch logs", { status: 502 });
  }

  const json = await res.json();
  return Response.json(json);
}
