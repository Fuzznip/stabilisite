import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { getDiaryEntries } from "@/lib/fetch/getDiaryEntries";
import { getSplits } from "@/lib/fetch/getSplits";
import { cn, getScaleDisplay } from "@/lib/utils";
import getUser from "@/lib/fetch/getUser";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function HomePage(): Promise<React.ReactElement> {
  const splits = (await getSplits()).slice(0, 10);
  const diaries = (await getDiaryEntries()).slice(0, 10);

  return (
    <div className="flex flex-col lg:flex-row gap-18 sm:gap-12 mb-12">
      <div className="flex flex-col gap-4 w-full lg:w-1/2">
        <h2 className="text-3xl text-foreground">Recent Splits</h2>
        {splits.map(async (split) => {
          const user = await getUser(split.userId);
          return (
            <div key={split.id} className="flex flex-col items-center">
              <span className="text-muted-foreground ml-auto mb-1">
                {formatDistanceToNow(split.date)} ago
              </span>
              <Card className="w-full">
                <CardContent className="p-4 flex items-center">
                  <div className="w-fit p-1 rounded-lg bg-accent mr-4">
                    <div className="relative size-12">
                      <Image
                        src={split.itemImg || ""}
                        alt={split.itemName}
                        sizes="100%"
                        fill
                        className="rounded-sm absolute object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-fit max-w-64 xl:max-w-full">
                    <span className="text-foreground text-2xl w-fit hidden sm:flex">
                      {split.itemName}
                    </span>
                    <span className="sm:text-muted-foreground text-2xl sm:text-lg w-fit">
                      <Link
                        href={`/profile/${user?.runescapeName}`}
                        className="hover:underline"
                      >
                        {user?.runescapeName}
                      </Link>
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex items-center text-2xl gap-2 justify-start w-32 ml-auto pl-4 sm:pl-0",
                      split.itemPrice >= 10000000 && "text-[#23FE9A]"
                    )}
                  >
                    <div className="relative size-8 mr-1">
                      <Image
                        src="/coins.png"
                        alt="coins"
                        className="absolute object-contain"
                        sizes="100%"
                        fill
                      />
                    </div>
                    {Math.floor(split.itemPrice / 10000 / 100)}m
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-4 w-full lg:w-1/2">
        <h2 className="text-3xl text-foreground">Recent Diaries</h2>
        {diaries.map(async (diary) => {
          const scale = getScaleDisplay(
            diary.shorthand?.replace(/\D/g, "") || "1"
          );
          return (
            <div key={diary.id} className="flex flex-col items-center">
              <span className="text-muted-foreground ml-auto mb-1">
                {formatDistanceToNow(diary.date || "")} ago
              </span>
              <Card className="w-full">
                <CardContent className="p-4 flex items-baseline">
                  <div className="flex items-sart flex-col">
                    <div className="flex w-fit">
                      <div className="text-foreground text-2xl w-fit inline">
                        {diary.name}{" "}
                        {scale && diary.time && (
                          <span className="text-muted-foreground inline">
                            ({scale})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-lg text-muted-foreground capitalize">
                      {diary.party
                        ?.sort((playerA, playerB) =>
                          playerA.localeCompare(playerB)
                        )
                        .map(async (member, index) => {
                          const user = await getUser(member);
                          return (
                            <span
                              key={member}
                              className={user ? "" : "text-muted-foreground/70"}
                            >
                              {user ? (
                                <Link
                                  href={`/profile/${member}`}
                                  className="hover:underline"
                                >
                                  {member}
                                </Link>
                              ) : (
                                member
                              )}
                              {index < (diary.party?.length || 0) - 1 && ", "}
                            </span>
                          );
                        })}
                    </span>
                  </div>
                  <span className="my-auto text-2xl ml-auto text-foreground font-bold">
                    {diary.time}
                  </span>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
