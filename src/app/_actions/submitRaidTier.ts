"use server";

import { RaidTierForm } from "@/lib/types";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { uploadToS3 } from "./uploadToS3";
import { revalidatePath } from "next/cache";
import { submitRaidTierForm } from "@/lib/db/raidTier";

export async function submitRaidTier(
  raidTierForm: RaidTierForm
): Promise<void> {
  try {
    const user = await getAuthUser();
    const fileUrls = raidTierForm.proof
      ? raidTierForm.proof.map((proof) => uploadToS3(proof))
      : [];
    await submitRaidTierForm(user, raidTierForm, await Promise.all(fileUrls));
    revalidatePath("/applications/raidTier");
    return;
  } catch (err) {
    throw err;
  }
}
