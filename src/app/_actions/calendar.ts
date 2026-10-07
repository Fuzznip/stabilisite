"use server";

import { revalidatePath } from "next/cache";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import type {
  CalendarEntry,
  CalendarEntryInput,
  DiscordChannel,
  DiscordSync,
} from "@/lib/types/calendar";

export type CalendarActionResult =
  | { success: true; discordSync: DiscordSync; entry?: CalendarEntry }
  | { success: false; error: string };

// Cover photos live beside the event assets. The bucket has no CORS rules, so
// the server uploads rather than handing the browser a signed URL; the bucket
// policy allows public reads, which the bot relies on to fetch them.
const COVER_BUCKET = "stability-event";
const COVER_REGION = "us-east-1";
const COVER_PREFIX = "cover-photos";
/** Under the 8mb server-action body limit in next.config.ts; the dialog matches. */
const MAX_COVER_BYTES = 7 * 1024 * 1024;

const s3 = new S3Client({
  region: COVER_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/** The backend has no auth of its own, so this is the only gate. */
async function isStaff(): Promise<boolean> {
  const user = await getAuthUser();
  return Boolean(user?.isAdmin);
}

async function send(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: CalendarEntryInput,
): Promise<CalendarActionResult> {
  if (!(await isStaff())) return { success: false, error: "Not authorized" };
  try {
    const res = await fetch(`${process.env.API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json.error ?? `Request failed (${res.status})` };
    }
    revalidatePath("/");
    return { success: true, discordSync: json.discord_sync ?? "skipped", entry: json.data };
  } catch (err) {
    console.error(`[calendar] ${method} ${path} failed:`, err);
    return { success: false, error: "Couldn't reach the server. Please try again." };
  }
}

export type CoverUploadResult = { success: true; url: string } | { success: false; error: string };

/** Takes FormData with a `file` image; returns its public URL. */
export async function uploadCoverPhoto(formData: FormData): Promise<CoverUploadResult> {
  if (!(await isStaff())) return { success: false, error: "Not authorized" };
  const file = formData.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return { success: false, error: "Pick an image file." };
  }
  if (file.size > MAX_COVER_BYTES) {
    return { success: false, error: "Cover photos can be up to 7MB." };
  }
  const safeName = file.name.replace(/[^\w.-]+/g, "_");
  const key = `${COVER_PREFIX}/${Date.now()}-${safeName}`;
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: COVER_BUCKET,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      }),
    );
  } catch (err) {
    console.error("[calendar] cover upload failed:", err);
    return { success: false, error: "Couldn't upload the cover photo. Try again." };
  }
  return { success: true, url: `https://${COVER_BUCKET}.s3.${COVER_REGION}.amazonaws.com/${key}` };
}

/** Null when the bot can't be reached (or outside production, where it's never asked). */
export async function getDiscordChannels(): Promise<DiscordChannel[] | null> {
  if (!(await isStaff())) return null;
  try {
    const res = await fetch(`${process.env.API_URL}/v2/calendar/discord-channels`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch (err) {
    console.error("[calendar] listing Discord channels failed:", err);
    return null;
  }
}

export async function createCalendarEntry(input: CalendarEntryInput): Promise<CalendarActionResult> {
  return send("/v2/calendar", "POST", input);
}

export async function updateCalendarEntry(
  id: string,
  input: CalendarEntryInput,
): Promise<CalendarActionResult> {
  return send(`/v2/calendar/${encodeURIComponent(id)}`, "PUT", input);
}

export async function deleteCalendarEntry(id: string): Promise<CalendarActionResult> {
  return send(`/v2/calendar/${encodeURIComponent(id)}`, "DELETE");
}
