import { NextResponse } from "next/server";
import { TileProgressResponse } from "@/lib/types/v2";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tileId: string }> }
) {
  try {
    const { tileId } = await params;
    const start = Date.now();
    const response = await fetch(
      `${process.env.API_URL}/v2/tiles/${tileId}/progress`,
      { next: { tags: ["bingo-progress", `tile-progress-${tileId}`] } }
    );
    const progress: TileProgressResponse = await response.json();
    console.log(`[tile-progress] ${tileId}: ${Date.now() - start}ms`);
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to fetch tile progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch tile progress" },
      { status: 500 }
    );
  }
}
