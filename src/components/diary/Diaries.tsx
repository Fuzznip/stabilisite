import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { getDiaries } from "@/lib/fetch/getDiaries";
import { DiaryTable } from "./DiaryTable";
import { getDiaryEntries } from "@/lib/fetch/getDiaryEntries";

export default async function Diaries(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  const diaries = await getDiaries();
  const entries = await getDiaryEntries();

  return <DiaryTable user={user} diaries={diaries} entries={entries} />;
}
