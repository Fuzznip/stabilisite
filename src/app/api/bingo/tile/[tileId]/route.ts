import { NextResponse } from "next/server";
import { TileWithTasks } from "@/lib/types/v2";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tileId: string }> }
) {
  try {
    const { tileId } = await params;
    const response = await fetch(`${process.env.API_URL}/v2/tiles/${tileId}`);
    const tile: TileWithTasks = await response.json();
    return NextResponse.json(tile);
  } catch (error) {
    console.error("Failed to fetch tile:", error);
    return NextResponse.json(
      { error: "Failed to fetch tile" },
      { status: 500 }
    );
  }
}
