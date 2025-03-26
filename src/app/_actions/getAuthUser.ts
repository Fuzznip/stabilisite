"use server";

import { auth } from "@/auth";
import { getStoredUser } from "@/lib/db/user";
import { User } from "@/lib/types";

export async function getAuthUser(): Promise<User | null> {
  const session = await auth();
  console.log(session);
  if (!session?.user?.id) {
    return null;
  }
  try {
    const storedUser = await getStoredUser(session.user);
    if (!storedUser) return session.user;

    const user: User = {
      id: storedUser.id,
      discordId: storedUser.discord_id,
      runescapeName: storedUser.runescape_name,
      rank: storedUser.rank,
      progressionData: JSON.parse(JSON.stringify(storedUser.progression_data)),
      image: session.user.image,
    };

    return user;
  } catch (err) {
    console.debug("Unauthenticated user", err);
    return null;
  }
}
