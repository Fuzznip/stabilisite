"use server";

import { DiaryForm } from "@/lib/types";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { submitDiaryEntry } from "@/lib/db/diary";
import { uploadToS3 } from "./uploadToS3";
import { revalidatePath } from "next/cache";

export async function submitDiary(diaryForm: DiaryForm): Promise<void> {
  try {
    const user = await getAuthUser();
    const fileUrl = await uploadToS3(diaryForm.proof);
    await submitDiaryEntry(user, diaryForm, fileUrl);
    revalidatePath("/applications/diary");
    return;
  } catch (err) {
    throw err;
  }
}
