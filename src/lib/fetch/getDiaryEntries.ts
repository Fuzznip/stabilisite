import { getDiaryApplications } from "@/lib/db/diary";
import { DiaryApplication, User } from "@/lib/types";

export async function getDiaryEntries(
  user?: User | null
): Promise<DiaryApplication[]> {
  const allDiaries = await getDiaryApplications(user);
  return allDiaries
    .filter((diary) => diary.status === "Accepted")
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
}
  