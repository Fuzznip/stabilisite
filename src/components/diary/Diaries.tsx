import { getDiaries } from "@/lib/fetch/getDiaries";
import { DiaryTable } from "./DiaryTable";
import { getDiaryEntries } from "@/lib/fetch/getDiaryEntries";
import { User } from "@/lib/types";

export default async function Diaries({user}: {user?: User | null}): Promise<React.ReactElement> {
  const diaries = await getDiaries();
  const entries = await getDiaryEntries(user);

  return <DiaryTable diaries={diaries} entries={entries} />;
}
