import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { getDiaryEntries } from "@/lib/fetch/getDiaryEntries";
import { getSplits } from "@/lib/fetch/getSplits";
import { cn } from "@/lib/utils";
import getUser from "@/lib/fetch/getUser";

export default async function HomePage(): Promise<React.ReactElement> {
  const splits = await getSplits();
  const diaries = await getDiaryEntries();
  return (
    <div className="flex flex-col lg:flex-row gap-12">
      <div className="flex flex-col gap-4 w-full lg:w-1/2">
        <h2 className="text-3xl text-foreground">Recent Splits</h2>
        {splits.map(async (split) => {
          const user = await getUser(split.userId);
          console.log(user);
          return (
            <Card key={split.id}>
              <CardContent className="p-4 flex items-center">
                <div className="w-fit h-fit p-1 rounded-lg bg-accent mr-4">
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
                <div className="flex flex-col">
                  <span className="text-foreground text-2xl">
                    {split.itemName}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-8 text-lg">
                    <span className="text-muted-foreground">
                      {user?.runescapeName || "test"}
                    </span>
                    <span className="text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(split.date || ""))}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center ml-auto text-2xl gap-2 justify-start sm:w-40",
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
          );
        })}
      </div>
      <div className="flex flex-col gap-4 w-full lg:w-1/2">
        <h2 className="text-3xl text-foreground">Recent Diaries</h2>
        {diaries.map((diary) => (
          <Card key={diary.id} className="p-4 flex items-center">
            <CardContent>{diary.date?.toISOString()}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
