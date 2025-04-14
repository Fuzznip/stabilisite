import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import NavBarLinks from "./NavBarLinks";
import { SignOut } from "./SignOut";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { DiaryDialog } from "./DiaryDialog";
import { getDiaries } from "../../lib/fetch/getDiaries";
import { SplitDialog } from "./SplitDialog";
import { getDiaryEntries } from "@/lib/fetch/getDiaryEntries";

export default async function NavBar(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  return (
    <div className="flex w-full h-16 px-4 justify-between items-center mt-2">
      <div className="flex items-center h-full w-full">
        <Link
          className="flex w-36 relative h-full bg-background rounded-lg hover:cursor-pointer"
          href="/"
        >
          <Image
            src={"/banner.png"}
            alt="Stability Banner"
            fill
            sizes="100%"
            className="object-contain"
          />
        </Link>
        <NavBarLinks user={user} />
      </div>
      <div className="flex items-center gap-2">
        {user && !user.isMember && (
          <Button className="px-4 bg-stability text-white mr-4" asChild>
            <Link href="/apply">Apply</Link>
          </Button>
        )}
        {user && user.isMember && <SubmitPopover />}
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={user ? "ghost" : "default"}
                className="size-10 aspect-square rounded-full relative overflow-hidden active:outline-2 active:outline-blue-500"
              >
                <Image
                  src={user?.image || ""}
                  alt="Profile pic"
                  className="absolute object-cover"
                  sizes="100%"
                  fill
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="flex flex-col gap-2 bg-background border p-4 items-center mt-2 rounded-md"
            >
              <ThemeToggle />
              <SignOut />
            </PopoverContent>
          </Popover>
        ) : (
          <Button className="px-4 bg-stability text-white" asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

async function SubmitPopover(): Promise<React.ReactElement> {
  const diaries = await getDiaries();
  const user = await getAuthUser();
  const entries = await getDiaryEntries(user);
  return (
    <Popover>
      <PopoverTrigger asChild className="mr-4">
        <Button className="flex items-center gap-1 bg-stability hover:bg-stability/90 text-white">
          Submit
          <ChevronDown className="w-4 h-4 hidden sm:flex" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2">
        <Card className="flex flex-col p-2">
          <DiaryDialog user={user} diaries={diaries} entries={entries} />
          <SplitDialog />
        </Card>
      </PopoverContent>
    </Popover>
  );
}
