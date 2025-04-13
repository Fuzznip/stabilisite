import { User as NextAuthUser } from "next-auth";
import { ranks } from "../utils";

export type User = {
  id?: string;
  discordId?: string;
  runescapeName?: string;
  rank?: Rank;
  rankPoints?: number;
  joinDate?: Date;
  progressionData?: ProgressionData;
  previousNames?: string[];
  altNames?: string[] | null;
  isAdmin?: boolean | null;
  isMember?: boolean;
} & NextAuthUser;

export type UserResponse = {
  id?: string;
  discord_id?: string;
  runescape_name?: string;
  rank?: Rank;
  rank_points?: number;
  join_date?: string;
  progression_data?: string;
  previous_names: string[];
  alt_names: string[] | null;
  is_admin: boolean | null;
  is_member?: boolean;
};

export type Rank = (typeof ranks)[number]["name"];

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
  itemId: string;
  itemPrice: number;
  itemImg: string;
  splitContribution: number;
  groupSize: number;
  screenshotLink?: string;
  date: Date;
};

export type SplitResponse = {
  id: string;
  item_id: string;
  user_id: string;
  item_name: string;
  item_price: string;
  split_contribution: string;
  group_size: number;
  screenshot_link: string;
  timestamp: string;
};

export type DiaryForm = {
  time: string;
  shorthand: string;
  teamMembers?: string[] | undefined;
  proof?: File | null;
  scale: number;
};

export type DiaryApplicationResponse = {
  diary_name: string;
  diary_shorthand: string;
  id: string;
  party: string[];
  party_ids: string[];
  proof: string;
  runescape_name: string;
  status: string;
  target_diary_id: string;
  time_split: string;
  timestamp: string;
  user_id: string;
  verdict_reason: string | null;
  verdict_timestamp: string | null;
};

export type DiaryApplication = Partial<{
  id: string;
  userId: string;
  date: Date;
  name: string;
  shorthand: string;
  party: string[];
  partyIds: string[];
  proof: string;
  runescapeName: string;
  status: string;
  targetDiaryId: string;
  time: string;
  verdictReason: string | null;
  verdictTimestamp: string | null;
}>;

export type Diary = {
  id: string;
  diaryName: string;
  diaryShorthand: string;
  bossName: string;
  scale: string;
  diaryDescription: string;
  diaryTime: string;
  diaryPoints: number;
};

export type ShortDiary = {
  name: string;
  scales: { scale: string; shorthand: string }[];
};

export type SplitForm = {
  item: string;
  price: number;
  teamSize: number;
  proof?: File | null;
};

export type OsrsItem = {
  id?: string;
  name: string;
  image?: string;
};

export type ApplicationResponse = {
  goals: string;
  id: string;
  reason: string;
  referral: string;
  runescape_name: string;
  status: string;
  timestamp: string;
  user_id: string;
  verdict_reason: string | null;
  verdict_timestamp: string;
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
  verdictDate: Date;
  date: Date;
}>;
