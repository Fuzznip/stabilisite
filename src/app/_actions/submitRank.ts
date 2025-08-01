"use server";

import { RankForm } from "@/lib/types";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { revalidatePath } from "next/cache";
import { submitRankForm } from "@/lib/db/rank";

export async function submitRank(rankForm: RankForm): Promise<void> {
  try {
    const user = await getAuthUser();
    await submitRankForm(user, rankForm);
    revalidatePath("/applications/rank");
    return;
  } catch (err) {
    throw err;
  }
}
