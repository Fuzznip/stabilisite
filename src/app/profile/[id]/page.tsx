import Image from "next/image";
import SplitChart from "./_components/SplitChart";
import RankPointPieChart from "./_components/RankPointPieChart";
import { Card } from "@/components/ui/card";
import getPlayerDetails from "./_actions/getPlayerDetails";
import { AlertCircleIcon, IdCard, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  cn,
  formatDate,
  getCAForShorthand,
  getMaxRaidTiers,
  ranks,
} from "@/lib/utils";
import { DiaryApplication, RaidName, User } from "@/lib/types";
import Diaries from "../../../components/diary/Diaries";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { getSplits } from "@/lib/fetch/getSplits";
import getUser from "@/lib/fetch/getUser";
import { ProfileSearch } from "./_components/ProfileSearch";
import getUsers from "@/lib/fetch/getUsers";
import { getDiaries } from "@/lib/fetch/getDiaries";
import { getDiaryEntries } from "@/lib/fetch/getDiaryEntries";
import { getRaidTierApplications } from "@/lib/db/raidTier";
import { getRaids } from "@/lib/fetch/getRaids";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  const user = await getUser(id);
  const users = await getUsers();
  return user?.runescapeName ? (
    <>
      <ProfileSearch users={users || []} />
      <ProfileHeader user={user} />
      <ProfileStats user={user} />
    </>
  ) : (
    <NoProfileMessage user={user} />
  );
}

async function ProfileHeader({
  user,
}: {
  user?: User;
}): Promise<React.ReactElement> {
  return (
    <div className="flex gap-8 items-center">
      <div className="size-20 aspect-square rounded-full relative overflow-hidden active:outline-2 active:outline-blue-500">
        <Image
          src={user?.discordImg || ""}
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

async function ProfileStats({
  user,
}: {
  user?: User;
}): Promise<React.ReactElement> {
  const splits = await getSplits(user);
  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between flex-col xl:flex-row gap-8">
        <UserRankAndStats user={user} />
        <UserRaidTiers user={user} />
      </div>
      <div className="flex justify-between flex-col xl:flex-row gap-8">
        <UserAchievements user={user} />
        <div className="xl:h-80 w-full xl:w-1/2">
          <Diaries user={user} />
        </div>
      </div>

      <Suspense fallback={<div className="w-72 h-72 bg-blue-400" />}>
        <SplitChart user={user} splits={splits} />
      </Suspense>
    </div>
  );
}

async function UserRankAndStats({
  user,
}: {
  user?: User;
}): Promise<React.ReactElement> {
  const rank = ranks.find((rank) => rank.name === (user?.rank || "Guest"));

  return (
    <section className="flex flex-col w-full xl:w-1/2">
      <h2 className="text-2xl mb-2">Rank & Stats</h2>
      <Card className="p-4 sm:pl-8  bg-card w-full h-72 flex flex-col sm:flex-row items-center gap-2">
        <div className="flex flex-col items-start sm:w-1/2 xl:w-full h-full justify-center sm:gap-12">
          <div className="flex flex-col w-fit">
            <h3 className="text-xl font-semibold mb-2">Rank</h3>
            <div className="flex items-center mb-4 lg:mb-0">
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
          </div>
          <div className="flex flex-col w-fit">
            <h3 className="text-xl font-semibold mb-2">Stats</h3>
            <Suspense fallback={<UserStatsLoading />}>
              <UserStats user={user} />
            </Suspense>
          </div>
        </div>
        <div className="flex flex-col sm:w-1/2 xl:w-[250px] items-start xl:items-center">
          <RankPointPieChart user={user} />
        </div>
      </Card>
    </section>
  );
}

async function UserRaidTiers({
  user,
}: {
  user?: User;
}): Promise<React.ReactElement> {
  const raidTierApplications = await getRaidTierApplications(user);
  const raids = await getRaids();

  const maxRaidTiers = getMaxRaidTiers(raidTierApplications, raids);

  return (
    <section className="flex flex-col w-full xl:w-1/2">
      <h2 className="text-2xl mb-2">Raid Tiers</h2>
      <div className="flex w-full items-start justify-between h-72 flex-col">
        {" "}
        {Object.keys(maxRaidTiers).map((raidKey) => (
          <Card
            key={raidKey}
            className="w-full h-21 flex relative rounded-lg overflow-hidden"
          >
            <>
              <div className="absolute inset-0">
                <Image
                  src={`/${raidKey}.png`}
                  alt="Achievement background"
                  className="object-cover"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="bg-gradient-to-r from-black to-transparent to-80% z-20 w-full h-full flex gap-1 flex-col text-2xl py-2 px-4 my-auto">
                <div className="flex flex-col my-auto">
                  <span className="text-muted-foreground text-xl">
                    {raidKey}
                  </span>
                  <span className="font-bold">
                    Tier {maxRaidTiers[raidKey as RaidName]}
                  </span>
                </div>
              </div>
            </>
          </Card>
        ))}
      </div>
    </section>
  );
}

async function UserAchievements({
  user,
}: {
  user?: User;
}): Promise<React.ReactElement> {
  const diaries = await getDiaries();
  const entries = await getDiaryEntries(user);
  const acceptedDiaries = entries.filter(
    (entry) => entry.status === "Accepted"
  );
  const combatAchievement = getMaxCombatAcheivement(acceptedDiaries);
  const achievementDiaries = diaries
    .filter((diary) => diary.scales.filter((scale) => !scale.diaryTime).length)
    .filter((diary) =>
      acceptedDiaries
        .map((acceptedDiary) => acceptedDiary.name)
        .includes(diary.name)
    )
    .filter((diary) => !!diary)
    .sort((diaryA, diaryB) => diaryA.name.localeCompare(diaryB.name));
  return (
    <section className="flex flex-col w-full xl:w-1/2 xl:h-80">
      <h2 className="text-2xl mb-2">Achievements</h2>
      <div className="flex flex-row items-center flex-wrap w-full gap-3">
        {achievementDiaries.map((diary) => {
          const caType = getCAForShorthand(combatAchievement?.shorthand || "");
          return (
            (diary.name !== "Combat Achievements" || combatAchievement) && (
              <Card
                key={diary.name}
                className={cn(
                  "w-48 h-16 flex relative rounded-lg overflow-hidden",
                  diary.name === "Combat Achievements" &&
                    combatAchievement &&
                    "pr-4"
                )}
              >
                <>
                  <div
                    className={cn(
                      "absolute inset-0",
                      diary.name === "Combat Achievements" && "right-4"
                    )}
                  >
                    <Image
                      src={`/${
                        diary.name === "Combat Achievements" &&
                        combatAchievement
                          ? getCAForShorthand(combatAchievement.shorthand || "")
                          : diary.name
                      }.png`}
                      alt="Achievement background"
                      className={cn(
                        diary.name === "Combat Achievements"
                          ? "object-contain object-right"
                          : "object-cover"
                      )}
                      fill
                      sizes="100%"
                    />
                  </div>
                  <div className="bg-background/40 z-20 w-full h-full flex">
                    <span className="my-auto ml-4 text-xl font-bold">
                      {diary.name === "Combat Achievements" && combatAchievement
                        ? `${caType} CA's`
                        : diary.name}
                    </span>
                  </div>
                </>
              </Card>
            )
          );
        })}
        {achievementDiaries.length === 0 && (
          <span className="text-2xl text-muted-foreground">
            No achievements yet...
          </span>
        )}
      </div>
    </section>
  );
}

async function UserStats({
  user,
}: {
  user?: User;
}): Promise<React.ReactElement> {
  try {
    const details = await getPlayerDetails(user?.runescapeName || "");

    const combatLevel = details?.combatLevel;
    const totalLevel = details?.latestSnapshot?.data.skills.overall.level;
    return (
      <div className="flex items-center w-full text-4xl">
        <div className="flex items-center w-1/2 justify-center border-r-2 border-border pr-4 mr-4">
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
      </div>
    );
  } catch {
    return (
      <Alert
        variant="destructive"
        className="bg-destructive text-destructive-foreground"
      >
        <AlertCircleIcon />
        <AlertTitle>Error fetching user stats</AlertTitle>
      </Alert>
    );
  }
}

function UserStatsLoading(): React.ReactElement {
  return (
    <div className="flex w-[260px] h-10 items-center justify-between">
      <LoadingSpinner />
    </div>
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

function NoProfileMessage({
  user,
}: {
  user: User | undefined;
}): React.ReactElement {
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

function getMaxCombatAcheivement(
  entries: DiaryApplication[]
): DiaryApplication | null {
  const gmDiary = entries.filter(
    (entry) => entry.shorthand === "gm" && entry.status === "Accepted"
  )[0];
  const masterDiary = entries.filter(
    (entry) => entry.shorthand === "master" && entry.status === "Accepted"
  )[0];
  const eliteDiary = entries.filter(
    (entry) => entry.shorthand === "elite" && entry.status === "Accepted"
  )[0];

  if (gmDiary) {
    return gmDiary;
  } else if (masterDiary) {
    return masterDiary;
  } else if (eliteDiary) {
    return eliteDiary;
  } else {
    return null;
  }
}
