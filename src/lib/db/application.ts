import { User as NextAuthUser } from "next-auth";
import { Application, UserResponse } from "../types";

export async function createApplication(
  authUser: NextAuthUser,
  application: Application
): Promise<UserResponse> {
  const clanApplication = {
    user_id: application.userId,
    runescape_name: application.runescapeName,
    discord_id: authUser.discordId,
    referral: application.referral,
    reason: application.reason,
    goals: application.goals,
  };
  const response = await fetch(`${process.env.API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clanApplication),
  });

  return response.json();
}
