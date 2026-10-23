"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export default async function acceptRaidTierApplication(id: string): Promise<void> {
  await apiFetch(`/applications/raidTier/${id}/accept`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  revalidatePath("/applications");
}
