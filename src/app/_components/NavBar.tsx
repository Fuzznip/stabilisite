import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import NavBarLinks from "./NavBarLinks";
import { SignOut } from "./SignOut";
import { Popover } from "@/lib/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/lib/components/ui/button";
import { getAuthUser } from "../_actions/getAuthUser";
import { Card } from "@/lib/components/ui/card";
import { ChevronDown, Coins, Notebook } from "lucide-react";

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
        {user && !user.isStabilityMember && (
          <Button className="px-4 bg-stability text-white mr-4" asChild>
            <Link href="/apply">Apply</Link>
          </Button>
        )}
        {user && user.isStabilityMember && <SubmitPopover />}
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
                  className="absolute"
                  objectFit="cover"
                  fill
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="flex flex-col gap-2 bg-background border p-4 items-center mt-2 rounded-sm"
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

function SubmitPopover(): React.ReactElement {
  return (
    <Popover>
      <PopoverTrigger asChild className="mr-4">
        <Button className="flex items-center gap-1 bg-stability hover:bg-stability/90 text-white">
          Submit
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2">
        <Card className="flex flex-col p-2">
          <Button
            variant="ghost"
            className="w-full hover:cursor-pointer justify-start"
          >
            <Notebook className="size-8 mr-1" />
            <span>Diary</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full hover:cursor-pointer justify-start"
          >
            <Coins className="size-8 mr-1" />
            <span>Split</span>
          </Button>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
