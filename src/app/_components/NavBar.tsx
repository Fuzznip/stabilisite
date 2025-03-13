import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";

export default function NavBar(): React.ReactElement {
  return (
    <div className="flex w-full h-20 px-2 justify-between items-center">
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
        {/* <div className="flex ml-8 gap-4 items-center">
          <Link href="/leaderboards">Leaderboard</Link>
        </div> */}
      </div>
      <ThemeToggle />
    </div>
  );
}
