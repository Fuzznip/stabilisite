export async function GET(
  request: Request,
  { params }: { params: Promise<{ territoryId: string }> }
) {
  const { territoryId } = await params;
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("team_id");

  const url = new URL(
    `${process.env.API_URL}/v2/territories/${territoryId}/proofs`
  );
  if (teamId) url.searchParams.set("team_id", teamId);

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    return new Response("Failed to fetch territory proofs", { status: 502 });
  }

  const json = await res.json();
  return Response.json(json.data ?? json);
}
