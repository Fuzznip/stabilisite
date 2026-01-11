import { NextResponse } from "next/server";
import { getGEPrices } from "@/lib/fetch/getGEPrices";

type OsrsItemMapping = {
  id: string;
  name: string;
  examine?: string;
  members?: boolean;
  lowalch?: number;
  limit?: number;
  value?: number;
  highalch?: number;
  icon?: string;
};

// Cache for 1 day (86400 seconds)
export const revalidate = 86400;

export async function GET() {
  try {
    // Fetch OSRS item mappings from RuneScape Wiki
    const mappingRes = await fetch(
      "https://prices.runescape.wiki/api/v1/osrs/mapping",
      {
        headers: {
          "User-Agent": "Stability Clan - @Tboodle on Discord",
        },
      }
    );
    const mappingData: OsrsItemMapping[] = await mappingRes.json();

    // Fetch GE prices
    const gePrices = await getGEPrices();

    // Map items with prices and filter
    const mappedItems = mappingData
      .map((item) => {
        const price = gePrices[item.id || ""];
        return {
          id: item.id,
          name: item.name,
          image: `https://oldschool.runescape.wiki/images/${encodeURIComponent(
            item.name.replace(/ /g, "_")
          )}.png`,
          price: price?.high || price?.low || 0,
        };
      })
      .filter((item) => item);

    return NextResponse.json(mappedItems);
  } catch (error) {
    console.error("Failed to fetch OSRS items:", error);
    return NextResponse.json(
      { error: "Failed to fetch OSRS items" },
      { status: 500 }
    );
  }
}
