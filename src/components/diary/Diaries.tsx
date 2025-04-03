import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { getDiaries } from "@/lib/fetch/getDiaries";
import { getUserDiaries } from "@/lib/fetch/getUserDiaries";
import { DiaryTable } from "./DiaryTable";

export default async function Diaries(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  const diaries = await getDiaries();
  const entries = await getUserDiaries();

  return <DiaryTable user={user} diaries={diaries} entries={entries} />;
}
