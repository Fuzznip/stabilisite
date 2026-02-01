import { Drop } from "@/lib/types/drop";
import { DocumentData } from "firebase/firestore";

export type RawDropData = {
  event_id: string;
  rsn: string;
  discord_id: string;
  trigger: string;
  source: string;
  quantity: string;
  type: string;
  value: string;
  timestamp: unknown;
  img_path?: string | null;
};

export type NewRawDropData = {
  id: string;
  event_id: string;
  rsn: string; // Original RSN from submission (may be alt name)
  discord_id: string;
  trigger: string;
  source: string;
  quantity: number;
  type: string;
  value: number;
  timestamp: string | null; // ISO 8601 format
  img_path: string | null;
  // Resolved user info
  player_id: string;
  player_rsn: string; // The actual account name
  // Team info (optional - only present if user is on a team)
  team_id?: string;
  team_name?: string;
};

function parseTimestamp(timestamp: unknown): Date {
  if (!timestamp) {
    return new Date();
  }

  // Handle string timestamps (e.g., "2026-01-13T03:18:45.997745+00:00")
  if (typeof timestamp === "string") {
    return new Date(timestamp);
  }

  // Handle Firestore Timestamp objects with toDate method
  if (
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof (timestamp as { toDate: () => Date }).toDate === "function"
  ) {
    return (timestamp as { toDate: () => Date }).toDate();
  }

  // Handle Firestore Timestamp with seconds/nanoseconds
  if (typeof timestamp === "object" && "seconds" in timestamp) {
    const ts = timestamp as { seconds: number; nanoseconds?: number };
    return new Date(ts.seconds * 1000 + (ts.nanoseconds ?? 0) / 1000000);
  }

  return new Date();
}

function isNewFormat(data: DocumentData): data is NewRawDropData {
  return "player_rsn" in data;
}

export function convertRawDropToDrop(id: string, data: DocumentData): Drop {
  if (isNewFormat(data)) {
    // New format with resolved player and team info
    return {
      id,
      player: data.rsn, // The submitted RSN (primary display)
      playerRsn: data.player_rsn, // The actual account name
      itemName: data.trigger,
      itemSource: data.source,
      quantity: data.quantity,
      submitType: data.type,
      date: parseTimestamp(data.timestamp),
      imgPath: data.img_path,
      teamId: data.team_id,
    };
  }

  // Old format - fallback
  const rawData = data as RawDropData;
  return {
    id,
    player: rawData.rsn,
    itemName: rawData.trigger,
    itemSource: rawData.source,
    quantity: rawData.quantity,
    submitType: rawData.type,
    date: parseTimestamp(rawData.timestamp),
    imgPath: rawData.img_path,
  };
}
