import {
  RaidTierApplication,
  RaidTierApplicationResponse,
  RaidTierForm,
  User,
} from "../types";

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

export async function getRaidTierApplications(): Promise<
  RaidTierApplication[]
> {
  const raidTierApplications = await fetch(
    `${process.env.API_URL}/applications/raidTier`
  ).then((res) => res.json());

  return raidTierApplications.map(
    (application: RaidTierApplicationResponse) => ({
      id: application.id,
      proof: application.proof,
      runescapeName: application.runescape_name,
      status: application.status,
      targetRaidTierId: application.target_raid_tier_id,
      date: new Date(application.timestamp),
      userId: application.user_id,
      verdictReason: application.verdict_reason,
      verdictDate: new Date(application.verdict_timestamp || ""),
    })
  );
}
