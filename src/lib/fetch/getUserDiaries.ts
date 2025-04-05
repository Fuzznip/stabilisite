import { getDiaryApplications } from "@/lib/db/diary";
import { DiaryApplication, User } from "@/lib/types";

export async function getUserDiaries(
  user?: User | null
): Promise<DiaryApplication[]> {
  const allDiaries = await getDiaryApplications(user);
  return allDiaries.filter((diary) => diary.status === "Accepted");
}
