import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import NavBarLinks from "./NavBarLinks";
import { auth } from "@/auth";
import { SignOut } from "./SignOut";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";

export default async function NavBar(): Promise<React.ReactElement> {
  const session = await auth();
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
        <NavBarLinks user={session?.user} />
      </div>
      <div className="flex items-center gap-2">
        {session?.user ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={session?.user ? "ghost" : "default"}
                className="size-10 aspect-square rounded-full relative overflow-hidden active:outline-2 active:outline-blue-500"
              >
                <Image
                  src={session?.user?.image || ""}
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
          <Button className={"px-4 bg-primary text-primary-foreground"} asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
