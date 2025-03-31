import Image from "next/image";
import SplitChart from "./_components/SplitChart";
import { Card } from "@/components/ui/card";
import { getAuthUser } from "@/app/_actions/getAuthUser";
import getPlayerDetails from "./_actions/getPlayerDetails";
import { Progress } from "@/components/ui/progress";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn, ranks } from "@/lib/utils";
import { User } from "@/lib/types";
import Diaries from "../../../components/Diaries";
import { getDiaries } from "@/app/_actions/getDiaries";

export default async function ProfilePage(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  return user?.runescapeName && user.isStabilityMember ? (
    <div className="flex flex-col w-2/3 min-w-96 mx-auto mt-12 gap-12">
      <ProfileHeader />
      <ProfileStats />
    </div>
  ) : (
    <NoProfileMessage user={user} />
  );
}

async function ProfileHeader(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  // const badges = ["Member", "US East", "league inhouses", "rivals inhouses"];
  return (
    <div className="flex gap-8 items-center">
      <div className="size-20 aspect-square rounded-full relative overflow-hidden active:outline-2 active:outline-blue-500">
        <Image
          src={user?.image || ""}
          alt="Profile pic"
          className="absolute"
          objectFit="cover"
          fill
        />
      </div>
      <div className="flex flex-col">
        <div className="flex gap-4 items-end">
          <h1 className="text-5xl font-extrabold">{user?.runescapeName}</h1>
          {/* <span className="text-foreground/60 text-2xl">
            Previously: ABoodle, BBoodle
          </span> */}
        </div>
        {/* <div className="flex gap-2 text-xl">
          <span>Join Date:</span>
          <span>March 23, 2024</span>
        </div> */}
        {/* <div className="flex mt-6 gap-2 w-full">
          {badges.map((badge) => (
            <Badge key={badge} className="bg-stability text-foreground">
              {badge}
            </Badge>
          ))}
        </div> */}
      </div>
    </div>
  );
}

async function ProfileStats(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  const diaries = await getDiaries();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between gap-8">
        <UserRank />
        <UserStats />
      </div>
      <Diaries user={user} diaries={diaries} />
      <SplitChart user={user} />
    </div>
  );
}

async function UserRank(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  const rankPoints = 500;
  // const rankPoints = user?.rankPoints || 0;
  const nextRank = { name: "Iron", points: 2000 };
  const rank = ranks.find((rank) => rank.name === (user?.rank || "Guest"));

  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Rank</h2>
      <Card className="p-4 bg-card w-full min-h-20 flex items-center">
        <div
          className={cn(
            "mx-auto flex flex-col w-full items-center",
            ["Quester", "Bronze", "Iron", "Steel"].includes(rank?.name || "")
              ? "gap-2"
              : "gap-4"
          )}
        >
          <div className="flex gap-4 items-center">
            <div className="relative size-12">
              <Image
                src={`/${rank?.name.toLowerCase()}.png`}
                alt={`${rank?.name.toLowerCase()} rank`}
                className="absolute object-contain"
                fill
              />
            </div>
            <div
              className={`capitalize text-4xl font-extrabold ${rank?.textColor} dark:brightness-150 brightness-90`}
            >
              {rank?.name}
            </div>
          </div>

          {rank?.name &&
            rank?.name !== "Guest" &&
            rank?.name !== "Trialist" && (
              <div className="flex gap-4 w-full items-center">
                {["Quester", "Bronze", "Iron", "Steel"].includes(rank.name) ? (
                  <div className="text-muted-foreground w-full text-nowrap font-bold items-center text-center">
                    {rankPoints.toLocaleString()} Clan Points
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full gap-1">
                    <Progress
                      value={(rankPoints / nextRank.points) * 100}
                      className={`h-4 ${rank?.bgColor} ${rank?.progressColor} ${rank?.textColor}`}
                    />
                    <div className="text-muted-foreground w-fit text-nowrap font-bold">
                      {rankPoints.toLocaleString()} /
                      {nextRank.points.toLocaleString()} Clan Points
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </Card>
    </section>
  );
}

async function UserStats(): Promise<React.ReactElement> {
  const details = await getPlayerDetails();

  const combatLevel = details?.combatLevel;
  const totalLevel = details?.latestSnapshot?.data.skills.overall.level;
  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Stats</h2>
      <Card className="flex items-center p-4 text-4xl h-full font-extrabold gap-4">
        <div className="flex items-center w-1/2 justify-center">
          <div className="relative size-8 mr-2">
            <Image
              src="/combat.png"
              alt="Combat level"
              className="absolute object-contain"
              fill
            />
          </div>
          {combatLevel}
        </div>
        <div className="flex items-center w-1/2 justify-center">
          <div className="relative size-8 mr-2">
            <Image
              src="/level.png"
              alt="Total level"
              className="absolute object-contain"
              fill
            />
          </div>
          {totalLevel}
        </div>
      </Card>
    </section>
  );
}

// async function UserAchievements(): Promise<React.ReactElement> {
//   const details = await getPlayerDetails();

//   const infernoComplete =
//     (details?.latestSnapshot?.data.bosses.tzkal_zuk.kills || 0) > 0;
//   return (
//     <section className="flex flex-col w-full">
//       <h2 className="text-2xl font-bold mb-2">Achievements</h2>
//       {infernoComplete && (
//         <div className="relative w-full  h-fit py-2 items-center flex overflow-hidden border rounded-xl">
//           <div className="w-full h-full from-background to-transparent from-20% absolute z-10" />
//           <Image
//             src="/inferno.png"
//             alt="inferno"
//             fill
//             className="absolute object-cover"
//           />
//           <div className="text-white text-2xl font-bold z-20 mx-auto w-fit">
//             Infernal Cape
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }

function NoProfileMessage({ user }: { user: User | null }): React.ReactElement {
  return (
    <Card className="w-fit mx-auto px-8 py-6 mt-42 flex flex-col">
      <div className="flex items-center">
        <TriangleAlert className="size-18 mr-6 text-stability" />
        <div className="flex flex-col">
          <h1 className="text-3xl">No Profile found</h1>
          <p className="text-muted-foreground text-xl">
            Please come back after joining the clan and syncing your profile
          </p>
        </div>
      </div>
      <Button
        asChild
        className="bg-stability text-white hover:bg-stability/90 w-fit ml-auto mt-8 text-lg px-8"
      >
        <Link
          href={
            !user?.image
              ? "/login"
              : !user?.isStabilityMember
              ? "/apply"
              : "/sync"
          }
        >
          {!user?.image ? "Login" : !user?.isStabilityMember ? "Apply" : "Sync"}
        </Link>
      </Button>
    </Card>
  );
}
