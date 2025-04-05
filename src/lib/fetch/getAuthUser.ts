import { auth } from "@/auth";
import { getStoredUser } from "@/lib/db/user";
import { User } from "@/lib/types";

export async function getAuthUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  try {
    const storedUser = await getStoredUser(session.user);
    if (!storedUser) return { ...session.user };

    const user: User = {
      id: storedUser.id,
      discordId: storedUser.discord_id,
      runescapeName: storedUser.runescape_name,
      rank: storedUser.rank || "Guest",
      rankPoints: storedUser.rank_points,
      joinDate: new Date(storedUser.join_date || ""),
      progressionData: JSON.parse(JSON.stringify(storedUser.progression_data)),
      image: session.user.image,
      isStabilityMember: session.user.isStabilityMember,
      name: session.user.name,
      previousNames: storedUser.previous_names.filter((name) => name),
      altNames: storedUser.alt_names,
    };

    return user;
  } catch (err) {
    console.debug(err);
    return null;
  }
}
