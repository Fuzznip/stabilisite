import BingoBoard from "./_components/BingoBoard";
import Countdown from "./_components/Countdown";
import Leaderboard from "./_components/Leaderboard";
import TeamMembers from "./_components/TeamMembers";

const BINGO_TIME_EST = new Date("2025-09-12T15:00:00-04:00");

export default async function HomePage() {
  if (new Date() < BINGO_TIME_EST) {
    return <Countdown />;
  }

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
