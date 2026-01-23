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
  if (
    typeof timestamp === "object" &&
    "seconds" in timestamp
  ) {
    const ts = timestamp as { seconds: number; nanoseconds?: number };
    return new Date(ts.seconds * 1000 + (ts.nanoseconds ?? 0) / 1000000);
  }

  return new Date();
}

export function convertRawDropToDrop(id: string, data: DocumentData): Drop {
  const rawData = data as RawDropData;
  return {
    id,
    player: rawData.rsn,
    itemName: rawData.trigger,
    itemSource: rawData.source,
    quantity: rawData.quantity,
    submitType: rawData.type,
    date: parseTimestamp(rawData.timestamp),
  };
}
