export async function GET(
  _request: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params;

  const res = await fetch(
    `${process.env.API_URL}/v2/challenges/${challengeId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return new Response("Failed to fetch challenge", { status: 502 });
  }

  const json = await res.json();
  console.log("[challenge route] raw response:", JSON.stringify(json).slice(0, 300));
  return Response.json(json.data ?? json);
}
