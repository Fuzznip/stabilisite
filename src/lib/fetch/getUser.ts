import { User } from "../types";

export default async function getUser(id: string): Promise<User | undefined> {
  const response = await fetch(`${process.env.API_URL}/users/${id}`);
  if (!response.ok) return undefined;

  const user = await response.json();
  return {
    id: user.id,
    discordId: user.discord_id,
    runescapeName: user.runescape_name,
    rank: user.rank || "Guest",
    rankPoints: user.rank_points,
    joinDate: new Date(user.join_date || ""),
    progressionData: JSON.parse(JSON.stringify(user.progression_data)),
    previousNames: user.previous_names.filter((name: string) => name),
    altNames: user.alt_names,
    isAdmin: user.is_admin,
    isMember: user.is_member,
    discordImg: user.discord_avatar_url,
    diaryPoints: user.diary_points,
    eventPoints: user.event_points,
    timePoints: user.time_points,
    splitPoints: user.split_points,
  };
}
