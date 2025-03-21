import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import NavBarLinks from "./NavBarLinks";
import SignInButton from "@/components/SignInButton";
import { auth, signOut } from "@/auth";
import { SignOut } from "./SignOut";

export default async function NavBar(): Promise<React.ReactElement> {
  const session = await auth();
  return (
    <div className="flex w-full h-16 px-2 justify-between items-center">
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
        <NavBarLinks />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <SignOut />
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={session?.user?.image || ""}
            alt="Profile pic"
            className="absolute"
            objectFit="cover"
            fill
          />
        </div>
      </div>
    </div>
  );
}
