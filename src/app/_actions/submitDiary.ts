"use server";

import { DiaryForm } from "@/lib/types";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { submitDiaryEntry } from "@/lib/db/diary";
import { uploadToS3 } from "./uploadToS3";

export async function submitDiary(diaryForm: DiaryForm): Promise<void> {
  try {
    const user = await getAuthUser();
    if (
      user?.runescapeName &&
      !diaryForm.teamMembers?.includes(user?.runescapeName)
    )
      diaryForm.teamMembers?.unshift(user?.runescapeName);

    const fileUrl = await uploadToS3(diaryForm.proof);
    await submitDiaryEntry(user, diaryForm, fileUrl);
    return;
  } catch (err) {
    console.debug(err);
    return;
  }
}
