"use server";

import { RankForm } from "@/lib/types";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { uploadToS3 } from "./uploadToS3";
import { revalidatePath } from "next/cache";
import { submitRankForm } from "@/lib/db/rank";

export async function submitRank(rankForm: RankForm): Promise<void> {
  try {
    const user = await getAuthUser();
    const fileUrls = rankForm.proof
      ? rankForm.proof.map((proof) => uploadToS3(proof))
      : [];
    await submitRankForm(user, rankForm, await Promise.all(fileUrls));
    revalidatePath("/applications/rank");
    return;
  } catch (err) {
    throw err;
  }
}
