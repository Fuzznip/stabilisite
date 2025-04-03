import Diaries from "../../components/diary/Diaries";

export default async function LeaderboardPage(): Promise<React.ReactElement> {
  return (
    <div className="flex flex-col w-full px-8 lg:px-0 lg:w-2/3 min-w-96 mx-auto mt-12 gap-12">
      <Diaries />
    </div>
  );
}
