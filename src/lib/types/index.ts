import { User as NextAuthUser } from "next-auth";
import { rank_colors } from "../utils";

export type User = {
  id?: string;
  discordId?: string;
  runescapeName?: string;
  rank?: RankName;
  rankPoints?: number;
  joinDate?: Date;
  progressionData?: ProgressionData;
  previousNames?: string[];
  altNames?: string[] | null;
  isAdmin?: boolean | null;
  isMember?: boolean;
  discordImg?: string;
  diaryPoints?: number;
  eventPoints?: number;
  timePoints?: number;
  splitPoints?: number;
  raidTierPoints?: number;
} & NextAuthUser;

export type UserResponse = {
  id?: string;
  discord_id?: string;
  discord_avatar_url: string;
  runescape_name?: string;
  rank?: RankName;
  rank_points?: number;
  join_date?: string;
  progression_data?: string;
  previous_names: string[];
  alt_names: string[] | null;
  is_admin: boolean | null;
  is_member?: boolean;
  diary_points: number;
  event_points: number;
  time_points: number;
  split_points: number;
  raid_tier_points: number;
};

export type RankName = (typeof rank_colors)[number]["name"];

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
  scale?: number;
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
  scales: { scale: string; shorthand: string; diaryTime?: string | null }[];
};

export type SplitForm = {
  item: string;
  price: number;
  teamSize: number;
  proof?: File | null;
};

export type RaidTierForm = {
  targetRaidTierId: string;
  proof?: File[] | null;
};
export type RankForm = {
  rank: string;
  rankOrder?: number;
  proof?: string[] | null;
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

export type RaidTierApplication = Partial<{
  id: string;
  proof: string;
  runescapeName: string;
  status: string;
  targetRaidTierId: string;
  date: Date;
  userId: string;
  verdictReason: string | null;
  verdictDate: Date;
}>;

export type RaidTierApplicationResponse = {
  id: string;
  proof: string;
  runescape_name: string;
  status: string;
  target_raid_tier_id: string;
  timestamp: string;
  user_id: string;
  verdict_reason: string | null;
  verdict_timestamp: string | null;
};
export type RankApplication = Partial<{
  id: string;
  proof: string[];
  runescapeName: string;
  status: string;
  rank: string;
  date: Date;
  userId: string;
  verdictReason: string | null;
  verdictDate: Date;
}>;

export type RankApplicationResponse = {
  id: string;
  proof: string;
  runescape_name: string;
  status: string;
  desired_rank: string;
  timestamp: string;
  user_id: string;
  verdict_reason: string | null;
  verdict_timestamp: string | null;
};
export type RankResponse = {
  id: string;
  rank_name: string;
  rank_minimum_points: number;
  rank_minimum_days: number;
  rank_order: number;
  rank_icon: string;
  rank_color: string;
  rank_description: string;
  rank_requirements: string[];
};
export type Rank = {
  id: string;
  rankName: string;
  rankMinimumPoints: number;
  rankMinimumDays: number;
  rankOrder: number;
  rankIcon: string;
  rankColor: string;
  rankDescription: string;
  rankRequirements: string[];
};

export type RaidTierResponse = {
  id: string;
  tier_name: string;
  tier_order: number;
  tier_icon: string | null;
  tier_color: string;
  tier_description: string;
  tier_requirements: string;
  tier_points: number;
};

export type Raid = {
  raidName: string;
  tiers: {
    id: string;
    order: number;
    icon: string | null;
    color: string;
    requirements: string;
    points: number;
  }[];
};

export type RaidName =
  | "Tombs of Amascut"
  | "Theatre of Blood"
  | "Chambers of Xeric";
