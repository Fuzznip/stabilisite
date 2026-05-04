export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const upstream = await fetch(
    `${process.env.API_URL}/v2/events/${eventId}/scoreboard/stream`,
    {
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
    }
  );

  if (!upstream.ok || !upstream.body) {
    return new Response("Failed to connect to upstream stream", {
      status: 502,
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering
    },
  });
}
