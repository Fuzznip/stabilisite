export async function GET(
  _request: Request,
  { params }: { params: Promise<{ triggerId: string }> }
) {
  const { triggerId } = await params;

  const res = await fetch(
    `${process.env.API_URL}/v2/triggers/${triggerId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return new Response("Failed to fetch trigger", { status: 502 });
  }

  const json = await res.json();
  return Response.json(json);
}
