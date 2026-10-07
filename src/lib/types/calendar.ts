import type { EventType } from "./v2";

export type CalendarEntryType = EventType | "adhoc";

export const CALENDAR_ENTRY_TYPES: readonly CalendarEntryType[] = [
  "bingo",
  "conquest",
  "botw",
  "clog",
  "adhoc",
];

/** A row from GET /v2/calendar. Dates are ISO 8601 UTC. */
export type CalendarEntry = {
  id: string;
  name: string;
  type: CalendarEntryType;
  start_date: string;
  end_date: string; // exclusive
  all_day: boolean;
  is_public: boolean;
  sync_discord: boolean;
  discord_event_id: string | null;
  event_id: string | null;
  /** A stage or voice channel the Discord event is held in. */
  location_channel_id: string | null;
  /** Otherwise free text: a "<#id>" text-channel mention, a link, a place. */
  location: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CalendarEntryInput = Pick<
  CalendarEntry,
  | "name"
  | "type"
  | "start_date"
  | "end_date"
  | "all_day"
  | "is_public"
  | "sync_discord"
  | "event_id"
  | "location_channel_id"
  | "location"
  | "cover_image_url"
>;

/** A channel a Discord event can be held in (stage, voice) or point to (text). */
export type DiscordChannel = {
  id: string;
  name: string;
  type: "stage" | "voice" | "text";
  category: string | null;
};

export type DiscordSync = "ok" | "failed" | "skipped";

/** What the calendar renders: a staff entry, or a v2 event with no entry. */
export type CalendarItem = {
  key: string;
  name: string;
  type: CalendarEntryType;
  start: Date;
  end: Date; // exclusive
  allDay: boolean;
  isPublic: boolean;
  href?: string;
  entry?: CalendarEntry;
};
