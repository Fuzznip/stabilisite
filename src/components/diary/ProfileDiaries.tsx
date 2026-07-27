import { getDiaries } from "@/lib/fetch/getDiaries";
import { getDiaryEntries } from "@/lib/fetch/getDiaryEntries";
import { User } from "@/lib/types";
import { DiaryProgress } from "./DiaryProgress";

export default async function ProfileDiaries({
  user,
}: {
  user?: User | null;
}): Promise<React.ReactElement> {
  const diaries = (await getDiaries()).filter(
    (diary) => diary.scales.filter((scale) => scale.diaryTime).length > 0
  );
  const entries = await getDiaryEntries(user);

  return <DiaryProgress diaries={diaries} entries={entries} />;
}
