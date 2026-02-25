import { NextResponse } from "next/server";
import { TileProofsResponse } from "@/lib/types/v2";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tileId: string }> },
) {
  try {
    const { tileId } = await params;
    const url = new URL(request.url);
    const teamId = url.searchParams.get("team_id");
    const taskId = url.searchParams.get("task_id");

    const backendUrl = new URL(
      `${process.env.API_URL}/v2/tiles/${tileId}/proofs`,
    );
    if (teamId) backendUrl.searchParams.set("team_id", teamId);
    if (taskId) backendUrl.searchParams.set("task_id", taskId);

    const response = await fetch(backendUrl.toString());
    const proofs: TileProofsResponse = await response.json();
    return NextResponse.json(proofs);
  } catch (error) {
    console.error("Failed to fetch tile proofs:", error);
    return NextResponse.json(
      { error: "Failed to fetch tile proofs" },
      { status: 500 },
    );
  }
}
