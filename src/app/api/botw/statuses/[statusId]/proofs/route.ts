export async function GET(
  _request: Request,
  { params }: { params: Promise<{ statusId: string }> },
) {
  const { statusId } = await params;

  const res = await fetch(
    `${process.env.API_URL}/v2/statuses/challenges/${statusId}/proofs`,
    // Proofs arrive as players submit, and the dialog is opened on demand —
    // a stale screenshot list is more confusing than a fresh fetch is costly.
    { cache: "no-store" },
  );

  if (!res.ok) {
    return new Response("Failed to fetch proofs", { status: 502 });
  }

  const json = await res.json();
  return Response.json({ data: json.data ?? [] });
}
