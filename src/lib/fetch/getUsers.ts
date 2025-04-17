import { User, UserResponse } from "../types";

export default async function getUsers(): Promise<User[] | undefined> {
  const response = await fetch(`${process.env.API_URL}/users`);
  if (!response.ok) return undefined;

  const users = await response.json();
  return users
    .map((user: UserResponse) => ({
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
    }))
    .sort((userA: User, userB: User) =>
      userA.runescapeName?.localeCompare(userB.runescapeName || "")
    );
}
