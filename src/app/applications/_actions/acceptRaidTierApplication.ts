"use server";

import { revalidatePath } from "next/cache";

export default async function acceptRaidTierApplication(
  id: string
): Promise<void> {
  await fetch(`${process.env.API_URL}/applications/raidTier/${id}/accept`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  revalidatePath("/applications/raidTier");
}
