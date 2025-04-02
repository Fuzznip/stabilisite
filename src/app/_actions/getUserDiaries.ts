"use server";

import { getDiaryApplications } from "@/lib/db/diary";
import { DiaryApplication, User } from "@/lib/types";

export async function getUserDiaries(
  user?: User | null
): Promise<DiaryApplication[]> {
  return getDiaryApplications(user);
}
