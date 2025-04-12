import { Application, User, UserResponse } from "../types";

export async function createApplication(
  user: User,
  application: Application
): Promise<UserResponse> {
  const clanApplication = {
    user_id: user.id,
    runescape_name: application.runescapeName,
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
