import { User as NextAuthUser } from "next-auth";

export type User = {
  id?: string;
  discordId?: string;
  runescapeName?: string;
  rank?: Rank;
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
