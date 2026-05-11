export async function GET(
  _request: Request,
  { params }: { params: Promise<{ territoryId: string }> }
) {
  const { territoryId } = await params;

  const res = await fetch(
    `${process.env.API_URL}/v2/territories/${territoryId}/progress`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return new Response("Failed to fetch territory progress", { status: 502 });
  }

  const json = await res.json();
  return Response.json(json.data ?? json);
}
