import { User as NextAuthUser } from "next-auth";

export type User = {
  id?: string;
  discordId?: string;
  runescapeName?: string;
  rank?: Rank;
  rankPoints?: number;
  progressionData?: ProgressionData;
} & NextAuthUser;

export type UserResponse = {
  id?: string;
  discord_id?: string;
  runescape_name?: string;
  rank?: Rank;
  progression_data?: string;
};

type Rank =
  | "unranked"
  | "bronze"
  | "iron"
  | "steel"
  | "mithril"
  | "adamantite"
  | "rune"
  | "dragon";

type ProgressionData = { [key: string]: unknown };

export type Leaderboard = {
  id: string;
  userId: string;
  diaryPoints: number;
  timestamp: string;
};

export type Announcement = {
  id: string;
  authorId: string;
  message: string;
  timestamp: string;
  isPinned: boolean;
};

export type Killcount = {
  id: string;
  userId: string;
  bossName: string;
  killCount: number;
  personalBest: string;
  scale: number;
  group: Record<string, string>;
  timestamp: string;
};

export type Webhook = {
  discordId: string;
  rank: string;
};

export type Split = {
  id: string;
  userId: string;
  itemName: string;
  itemPrice: number;
  splitContribution: number;
  groupSize: number;
  screenshotLink?: string;
  timestamp: string;
};

export type Application = Partial<{
  id: string;
  userId: string;
  runescapeName: string;
  referral: string;
  reason: string;
  goals: string;
  status: string;
  verdictReason: string;
  verdictTimestamp: string;
  timestamp: string;
}>;
