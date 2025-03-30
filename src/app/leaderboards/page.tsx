import Diaries from "../../lib/components/Diaries";

export default function LeaderboardPage(): React.ReactElement {
  return (
    <div className="flex flex-col w-2/3 min-w-96 mx-auto mt-12 gap-12">
      <Diaries />
    </div>
  );
}
