"use server";

import { DiaryForm } from "@/lib/types";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { submitDiaryEntry } from "@/lib/db/diary";
import { uploadToS3 } from "./uploadToS3";
import { revalidatePath } from "next/cache";
import { ActionResult } from "./submitRank";

export async function submitDiary(diaryForm: DiaryForm): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    const fileUrl = await uploadToS3(diaryForm.proof);
    await submitDiaryEntry(user, diaryForm, fileUrl);
    revalidatePath("/applications/diary");
    return { success: true };
  } catch (err) {
    console.error("[submitDiary] Failed:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}
