"use server";

import { getDiaryApplications } from "@/lib/db/diary";
import { ShortDiary, User } from "@/lib/types";

export async function getUserDiaries(user?: User): Promise<ShortDiary[]> {
  return getDiaryApplications(user);
}
