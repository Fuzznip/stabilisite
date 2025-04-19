"use server";

import { revalidatePath } from "next/cache";

export default async function rejectRaidTierApplication(
  id: string
): Promise<void> {
  await fetch(`${process.env.API_URL}/applications/raidTier/${id}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ verdict_reason: "lol I dont support this yet" }),
  });
  revalidatePath("/applications/raidTier");
}
