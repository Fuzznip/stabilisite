import Image from "next/image";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import SplitChart from "./_components/SplitChart";
import { Card } from "@/components/ui/card";
import { getAuthUser } from "@/app/_actions/getAuthUser";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
// import { WOMClient } from "@wise-old-man/utils";

// const client = new WOMClient();

export default async function ProfilePage(): Promise<React.ReactElement> {
  // const player = await client.players.getPlayerDetailsById(56382);
  return (
    <div className="flex flex-col w-2/3 min-w-96 mx-auto mt-12 gap-12">
      <ProfileHeader />
      <ProfileStats />
    </div>
  );
}

async function ProfileHeader(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  const badges = ["Member", "US East", "league inhouses", "rivals inhouses"];
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
          <h1 className="text-3xl font-extrabold">{user?.runescapeName}</h1>
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
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between gap-8">
        <UserRank />
        <UserAchievements />
      </div>
      <SplitChart user={user} />
    </div>
  );
}

async function UserRank(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  const rank = "steel";
  let color;
  console.log(rank);
  switch (rank) {
    case "bronze":
      color = "text-[#5B462A]";
      break;
    case "iron":
      color = "text-[#635C5B]";
      break;
    case "steel":
      color = "text-[#8F8586]";
      break;
    case "mithril":
      color = "text-[#4C4C6F]";
      break;
    case "adamantite":
      color = "text-[#506350]";
      break;
    case "rune":
      color = "text-[#516D78]";
      break;
    case "dragon":
      color = "text-[#69140A]";
      break;
    default:
      color = "text-foreground";
  }
  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Rank</h2>
      <Card className="p-4 bg-card w-full">
        <div className="w-fit mx-auto flex items-center">
          <div className="relative size-12">
            <Image
              src={`/${rank}.png`}
              alt={`${rank} rank`}
              className="absolute object-contain"
              fill
            />
          </div>
          <h3
            className={`capitalize ml-4 text-4xl font-extrabold ${color} dark:brightness-150 brightness-90`}
          >
            {rank}
          </h3>
        </div>
      </Card>
    </section>
  );
}
function UserAchievements(): React.ReactElement {
  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Achievements</h2>
      <Card className="p-4 bg-card">achievemnt stuff</Card>
    </section>
  );
}
