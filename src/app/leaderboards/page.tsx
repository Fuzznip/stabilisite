import Diaries from "../../components/Diaries";
import { getDiaries } from "../_actions/getDiaries";
import { getUserDiaries } from "../_actions/getUserDiaries";

export default async function LeaderboardPage(): Promise<React.ReactElement> {
  const diaries = await getDiaries();
  const userDiaries = await getUserDiaries();

  return (
    <div className="flex flex-col w-full px-8 lg:px-0 lg:w-2/3 min-w-96 mx-auto mt-12 gap-12">
      <Diaries diaries={diaries} entries={userDiaries} />
    </div>
  );
}
