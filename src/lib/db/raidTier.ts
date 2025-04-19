import { RaidTierForm, User } from "../types";

export async function submitRaidTierForm(
  user: User | null,
  raidTierForm: RaidTierForm,
  fileUrls: string[]
): Promise<void> {
  const raidTierRequest = {
    user_id: user?.discordId,
    target_raid_tier_id: raidTierForm.targetRaidTierId,
    proof: fileUrls[0],
  };
  console.log(raidTierRequest);
  const response = await fetch(`${process.env.API_URL}/applications/raidTier`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(raidTierRequest),
  });
  if (!response.ok) throw await response.text();
  return;
}
