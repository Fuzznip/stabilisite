import Image from "next/image";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import SplitChart from "./_components/SplitChart";
import { Card } from "@/components/ui/card";
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
  const session = await auth();
  const badges = ["Member", "US East", "league inhouses", "rivals inhouses"];
  return (
    <div className="flex gap-8">
      <div className="size-28 aspect-square rounded-full relative overflow-hidden active:outline-2 active:outline-blue-500">
        <Image
          src={session?.user?.image || ""}
          alt="Profile pic"
          className="absolute"
          objectFit="cover"
          fill
        />
      </div>
      <div className="flex flex-col">
        <div className="flex gap-4 items-end">
          <h1 className="text-3xl font-extrabold">{session?.user?.name}</h1>
          <span className="text-foreground/60 text-2xl">
            Previously: ABoodle, BBoodle
          </span>
        </div>
        <div className="flex gap-2 text-xl">
          <span>Join Date:</span>
          <span>March 23, 2024</span>
        </div>
        <div className="flex mt-6 gap-2 w-full">
          {badges.map((badge) => (
            <Badge key={badge} className="bg-stability text-foreground">
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

async function ProfileStats(): Promise<React.ReactElement> {
  const session = await auth();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between gap-8">
        <UserRank />
        <UserAchievements />
      </div>
      <SplitChart user={session?.user} />
    </div>
  );
}

function UserRank(): React.ReactElement {
  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Rank</h2>
      <Card className="p-4 bg-card">rank stuff</Card>
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
