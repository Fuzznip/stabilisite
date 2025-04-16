import Diaries from "../../components/diary/Diaries";
import getUsers from "@/lib/fetch/getUsers";
import ClanPointTable from "./_components/ClanPointTable";

export default async function LeaderboardPage(): Promise<React.ReactElement> {
  return (
    <div className="flex w-full h-full flex-col gap-12">
      <ClanPointLeaderboard />
      <Diaries />
    </div>
  );
}

async function ClanPointLeaderboard(): Promise<React.ReactElement> {
  const users =
    (await getUsers())
      ?.filter((user) => user.rank !== "Guest" && user.rank !== "Trialist")
      .sort(
        (userA, userB) => (userB.rankPoints || 0) - (userA.rankPoints || 0)
      ) ?? [];

  return <ClanPointTable users={users} />;
}
