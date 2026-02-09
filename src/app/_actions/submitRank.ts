"use server";

import { RankForm } from "@/lib/types";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { revalidatePath } from "next/cache";
import { submitRankForm } from "@/lib/db/rank";

export type ActionResult = { success: true } | { success: false; error: string };

export async function submitRank(rankForm: RankForm): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await submitRankForm(user, rankForm);
    revalidatePath("/applications/rank");
    return { success: true };
  } catch (err) {
    console.error("[submitRank] Failed:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}
