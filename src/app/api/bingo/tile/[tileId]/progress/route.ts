import { NextResponse } from "next/server";
import { TileProgressResponse } from "@/lib/types/v2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tileId: string }> }
) {
  try {
    const { tileId } = await params;
    const response = await fetch(
      `${process.env.API_URL}/v2/tiles/${tileId}/progress`
    );
    const progress: TileProgressResponse = await response.json();
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to fetch tile progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch tile progress" },
      { status: 500 }
    );
  }
}
