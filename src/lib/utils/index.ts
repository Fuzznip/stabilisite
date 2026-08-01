import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ShortDiary,
  DiaryApplication,
  RaidTierApplication,
  Raid,
  RaidName,
} from "../types";
import { getS3SignedUrl } from "@/app/_actions/getS3SignedUrl";
import { MedalLevel } from "../types/v2";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  try {
    return Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }
}
export function formatDateTime(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const rank_colors = [
  {
    name: "Guest",
    textColor: "text-[#028968]",
    bgColor: "bg-[#028968]/50",
    progressColor: "[&>div]:bg-[#028968]",
  },
  {
    name: "Applied",
    textColor: "text-[#028968]",
    bgColor: "bg-[#028968]/50",
    progressColor: "[&>div]:bg-[#028968]",
  },
  {
    name: "Trialist",
    textColor: "text-[#D76222]",
    bgColor: "bg-[#D76222]/50",
    progressColor: "[&>div]:bg-[#D76222]",
  },
  {
    name: "Quester",
    textColor: "text-[#5077E3]",
    bgColor: "bg-[#5077E3]/50",
    progressColor: "[&>div]:bg-[#5077E3]",
  },
  {
    name: "Bronze",
    textColor: "text-[#5B462A]",
    bgColor: "bg-[#5B462A]/50",
    progressColor: "[&>div]:bg-[#5B462A]",
  },
  {
    name: "Iron",
    textColor: "text-[#635C5B]",
    bgColor: "bg-[#635C5B]/50",
    progressColor: "[&>div]:bg-[#635C5B]",
  },
  {
    name: "Steel",
    textColor: "text-[#8F8586]",
    bgColor: "bg-[#8F8586]/50",
    progressColor: "[&>div]:bg-[#8F8586]",
  },
  {
    name: "Mithril",
    textColor: "text-[#4C4C6F]",
    bgColor: "bg-[#4C4C6F]/50",
    progressColor: "[&>div]:bg-[#4C4C6F]",
  },
  {
    name: "Adamant",
    textColor: "text-[#506350]",
    bgColor: "bg-[#506350]/50",
    progressColor: "[&>div]:bg-[#506350]",
  },
  {
    name: "Rune",
    textColor: "text-[#516D78]",
    bgColor: "bg-[#516D78]/50",
    progressColor: "[&>div]:bg-[#516D78]",
  },
  {
    name: "Dragon",
    textColor: "text-[#69140A]",
    bgColor: "bg-[#69140A]/50",
    progressColor: "[&>div]:bg-[#69140A]",
  },
] as const;

// Diary times come in a few shapes: "MM:SS", "MM:SS.T", "H:MM:SS.T" — the
// stored targets include an hours segment (e.g. "0:26:30.0") while submitted
// application times often omit it ("26:25"). Parse the colon segments from the
// right (…hours:minutes:seconds) so both compare correctly. Returns total
// seconds, or null when the value can't be parsed.
export function parseDiaryTimeToSeconds(
  time?: string | null,
): number | null {
  if (!time) return null;
  const [main, fraction = "0"] = time.trim().split(".");
  const segments = main.split(":").map(Number);
  const fractional = Number(`0.${fraction}`);
  if (segments.some((part) => Number.isNaN(part)) || Number.isNaN(fractional))
    return null;
  const whole = segments.reduce((acc, segment) => acc * 60 + segment, 0);
  return whole + fractional;
}

// Normalizes a diary time to a compact display ("0:26:30.0" -> "26:30",
// "0:24:15.5" -> "24:15.5"), dropping a zero hours segment and trailing tenths.
export function formatDiaryTime(time?: string | null): string {
  const totalSeconds = parseDiaryTimeToSeconds(time);
  if (totalSeconds == null) return time ?? "";
  const whole = Math.floor(totalSeconds);
  const tenths = Math.round((totalSeconds - whole) * 10);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const base =
    hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${minutes}:${pad(seconds)}`;
  return tenths > 0 ? `${base}.${tenths}` : base;
}

// Collection log item icons: the exact 36x32 icons the client draws, rendered
// from the game cache's item models by scripts/cache/extract.sh and uploaded to
// S3 by scripts/cache/upload-items.sh rather than committed (1,710 files).
// The host is whitelisted in next.config.ts.
const ITEM_ICON_BASE =
  "https://stability-event.s3.us-east-1.amazonaws.com/collection-log/items";

export function collectionLogItemImage(itemId: number): string {
  return `${ITEM_ICON_BASE}/${itemId}.png`;
}

export function getScaleDisplay(scale: string): string | undefined {
  switch (scale) {
    case "1":
      return "Solo";
    case "2":
      return "Duo";
    case "3":
      return "Trio";
    case "4":
      return "4 Man";
    case "5":
      return "5 Man";
    case "8":
      return "8 Man";
    default:
      return undefined;
  }
}

export function getCAForShorthand(shorthand: string): string {
  switch (shorthand) {
    case "master":
      return "Master";
    case "gm":
      return "Grandmaster";
    case "elite":
      return "Elite";
    default:
      return "";
  }
}

export function mapDiariesForComabtAchievements(
  diary: ShortDiary,
  entries: DiaryApplication[],
): ShortDiary | null {
  const gmCompleted = entries.filter(
    (entry) => entry.shorthand === "gm" && entry.status === "Accepted",
  ).length;
  const masterCompleted = entries.filter(
    (entry) => entry.shorthand === "master" && entry.status === "Accepted",
  ).length;
  const eliteCompleted = entries.filter(
    (entry) => entry.shorthand === "elite" && entry.status === "Accepted",
  ).length;

  let scales: {
    scale: string;
    shorthand: string;
    diaryTime?: string | null;
  }[] = [];
  if (gmCompleted) {
    scales = [];
  } else if (masterCompleted) {
    scales = diary.scales.filter((scale) => scale.shorthand === "gm");
  } else if (eliteCompleted) {
    scales = diary.scales.filter(
      (scale) => scale.shorthand === "gm" || scale.shorthand === "master",
    );
  } else {
    scales = diary.scales;
  }
  if (scales.length > 0)
    return {
      ...diary,
      scales,
    };

  return null;
}

export function getMaxRaidTiers(
  applications: RaidTierApplication[],
  raids: Raid[],
): {
  "Tombs of Amascut": number;
  "Theatre of Blood": number;
  "Chambers of Xeric": number;
} {
  const raidMaxes = {
    "Tombs of Amascut": 0,
    "Theatre of Blood": 0,
    "Chambers of Xeric": 0,
  };

  const raidTiers = new Map(
    raids.flatMap((raid) =>
      raid.tiers.map(
        (tier) => [tier.id, { name: raid.raidName, tier: tier.order }] as const,
      ),
    ),
  );

  for (const { targetRaidTierId } of applications) {
    const raid = raidTiers.get(targetRaidTierId || "");

    if (!raid) continue;

    if (raid.name && raid.tier > raidMaxes[raid.name as RaidName]) {
      raidMaxes[raid.name as RaidName] = raid.tier;
    }
  }

  return raidMaxes;
}

export function getFileUrlsForProof(files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(async (file: File) => {
      const [fileUrl, signedUrl] = await getS3SignedUrl(file.name, file.type);

      const res = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // A failed PUT (CORS/403/expired URL) previously returned a broken URL
      // silently; throw so the caller surfaces an error instead of appearing
      // to do nothing.
      if (!res.ok) {
        throw new Error(`Failed to upload proof "${file.name}" (${res.status})`);
      }

      return fileUrl;
    }),
  );
}

/**
 * Helper to get medal level from tasks_completed count
 */
export function getMedalLevel(tasksCompleted: number): MedalLevel {
  const medalMap: Record<number, MedalLevel> = {
    0: "none",
    1: "bronze",
    2: "silver",
    3: "gold",
  };
  return medalMap[tasksCompleted] ?? "none";
}
