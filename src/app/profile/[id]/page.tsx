import Image from "next/image";
import SplitChart from "./_components/SplitChart";
import { Card } from "@/components/ui/card";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import getPlayerDetails from "./_actions/getPlayerDetails";
import { IdCard, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate, ranks } from "@/lib/utils";
import { User } from "@/lib/types";
import Diaries from "../../../components/diary/Diaries";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { getSplits } from "@/lib/fetch/getSplits";

export default async function ProfilePage(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  console.log(user);
  return user?.runescapeName && user.isMember ? (
    <>
      <ProfileHeader />
      <ProfileStats />
    </>
  ) : (
    <NoProfileMessage user={user} />
  );
}

async function ProfileHeader(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  return (
    <div className="flex gap-8 items-center">
      <div className="size-20 aspect-square rounded-full relative overflow-hidden active:outline-2 active:outline-blue-500">
        <Image
          src={user?.image || ""}
          alt="Profile pic"
          className="absolute object-contain"
          sizes="100%"
          fill
        />
      </div>
      <div className="flex flex-col max-w-full">
        <div className="flex flex-col items-start w-full">
          <h1 className="text-4xl font-extrabold flex items-center">
            {user?.runescapeName}
            <Tooltip>
              <TooltipTrigger asChild>
                <IdCard className="size-6 ml-4" />
              </TooltipTrigger>
              <TooltipContent
                className="bg-background p-4 border text-sm rounded-xl flex gap-2 flex-col"
                side="right"
                align="start"
                sideOffset={8}
              >
                <span>
                  Member since {formatDate(new Date(user?.joinDate || ""))}
                </span>
                {user?.previousNames}
                {user?.previousNames?.length ? (
                  <div className="flex gap-1 text-muted-foreground">
                    <span>Previously known as:</span>
                    <div className="flex">
                      {user?.previousNames?.join(", ")}
                    </div>
                  </div>
                ) : undefined}
              </TooltipContent>
            </Tooltip>
          </h1>
          {user?.altNames && (
            <div className="text-foreground/60 text-lg flex">
              {user.altNames.join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function ProfileStats(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  const splits = await getSplits(user);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between gap-8 flex-col lg:flex-row">
        <UserRank />
        <Suspense fallback={<UserStatsLoading />}>
          <UserStats />
        </Suspense>
      </div>
      <Diaries user={user} />
      <SplitChart user={user} splits={splits} />
    </div>
  );
}

async function UserRank(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  const rankPoints = user?.rankPoints || 0;
  // const nextRank = { name: "Iron", points: 2000 };
  const rank = ranks.find((rank) => rank.name === (user?.rank || "Guest"));

  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Rank</h2>
      <Card className="p-4 bg-card w-full min-h-20 flex items-center">
        <div className="mx-auto flex w-full items-center gap-2 md:gap-0">
          <div className="flex items-center justify-center pr-4 border-r-2 border-r-border w-1/2">
            <div className="relative size-10 mr-2">
              <Image
                src={`/${rank?.name.toLowerCase()}.png`}
                alt={`${rank?.name.toLowerCase()} rank`}
                className="absolute object-contain"
                sizes="100%"
                fill
              />
            </div>
            <div
              className={`capitalize text-4xl ${rank?.textColor} dark:brightness-150 brightness-90`}
            >
              {rank?.name}
            </div>
          </div>
          <div className="flex items-center w-1/2 justify-center lg:ml-4">
            <span className="text-foreground text-4xl mr-4">
              {Math.floor(rankPoints).toLocaleString()}
            </span>
            <span className="mt-auto text-lg lg:text-xl">Clan Points</span>
          </div>
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
      <Card className="flex items-center p-4 text-4xl h-full">
        <div className="flex items-center w-1/2 justify-center border-r-2 border-r-border">
          <div className="relative size-8 mr-2">
            <Image
              src="/combat.png"
              alt="Combat level"
              className="absolute object-contain"
              sizes="100%"
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
              sizes="100%"
              fill
            />
          </div>
          {totalLevel}
        </div>
      </Card>
    </section>
  );
}

function UserStatsLoading(): React.ReactElement {
  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Stats</h2>
      <Card className="flex items-center p-4 text-4xl h-full font-extrabold gap-4 justify-center">
        <LoadingSpinner />
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
        <Link href={!user?.image ? "/login" : "/apply"}>
          {!user?.image ? "Login" : "Apply"}
        </Link>
      </Button>
    </Card>
  );
}
