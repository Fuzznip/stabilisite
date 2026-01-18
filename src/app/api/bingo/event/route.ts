import { NextResponse } from "next/server";
import { EventWithDetails } from "@/lib/types/v2";

export async function GET() {
  try {
    const response = await fetch(`${process.env.API_URL}/v2/events/active`);
    const event: EventWithDetails = await response.json();
    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
