import Diaries from "../../components/Diaries";
import { getDiaries } from "../_actions/getDiaries";

export default async function LeaderboardPage(): Promise<React.ReactElement> {
  const diaries = await getDiaries();
  return (
    <div className="flex flex-col w-2/3 min-w-96 mx-auto mt-12 gap-12">
      <Diaries diaries={diaries} />
    </div>
  );
}
