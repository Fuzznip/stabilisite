import BingoBoard from "./_components/BingoBoard";
import Leaderboard from "./_components/Leaderboard";
import TeamMembers from "./_components/TeamMembers";

export default async function HomePage() {
  return (
    <>
      <div className="hidden lg:flex w-full h-full flex-row items-start justify-center gap-8 z-10">
        <BingoBoard />
        <div className="flex flex-col gap-8">
          <Leaderboard />
          <TeamMembers />
        </div>
      </div>
      <div className="flex lg:hidden w-full h-full flex-col justify-center items-center gap-8 pb-12 px-2">
        <BingoBoard />
        <Leaderboard />
        <TeamMembers />
      </div>
    </>
  );
}
