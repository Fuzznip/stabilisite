import { NextResponse } from "next/server";
import { TeamProgressResponse } from "@/lib/types/v2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const response = await fetch(
      `${process.env.API_URL}/v2/teams/${teamId}/progress`
    );
    const progress: TeamProgressResponse = await response.json();
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to fetch team progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch team progress" },
      { status: 500 }
    );
  }
}
