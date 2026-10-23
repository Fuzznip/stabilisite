import { apiFetch } from "@/lib/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ territoryId: string }> }
) {
  const { territoryId } = await params;
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("team_id");

  const query = teamId ? `?${new URLSearchParams({ team_id: teamId })}` : "";

  const res = await apiFetch(
    `/v2/territories/${territoryId}/proofs${query}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return new Response("Failed to fetch territory proofs", { status: 502 });
  }

  const json = await res.json();
  return Response.json(json.data ?? json);
}
