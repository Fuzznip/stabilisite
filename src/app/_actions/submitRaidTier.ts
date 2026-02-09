"use server";

import { RaidTierForm } from "@/lib/types";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { uploadToS3 } from "./uploadToS3";
import { revalidatePath } from "next/cache";
import { submitRaidTierForm } from "@/lib/db/raidTier";
import { ActionResult } from "./submitRank";

export async function submitRaidTier(
  raidTierForm: RaidTierForm
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    const fileUrls = raidTierForm.proof
      ? raidTierForm.proof.map((proof) => uploadToS3(proof))
      : [];
    await submitRaidTierForm(user, raidTierForm, await Promise.all(fileUrls));
    revalidatePath("/applications/raidTier");
    return { success: true };
  } catch (err) {
    console.error("[submitRaidTier] Failed:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}
