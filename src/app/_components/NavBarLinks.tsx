"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NavBarLinks({
  user,
}: {
  user: User | null;
}): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = [
    { href: "/", title: "Home" },
    { href: `/profile/${user?.discordId}`, title: "Profile" },
    { href: "/leaderboards", title: "Leaderboards" },
  ];

  if (user?.isAdmin) {
    tabs.push({ href: "/applications", title: "Applications" });
    tabs.push({ href: "/bingo", title: "Bingo" });
  }

  return (
    <>
      <div className="items-center ml-8 gap-4 hidden sm:flex">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={`${tab.href}`}
            className={cn(
              "p-2 text-muted-foreground hover:text-foreground font-bold",
              tab.href === pathname && "text-primary hover:text-primary"
            )}
          >
            {tab.title}
          </Link>
        ))}
      </div>
      <div className="block sm:hidden w-44">
        <Select onValueChange={(value) => router.push(value)} defaultValue="/">
          <SelectTrigger className="text-lg flex sm:hidden bg-background! ml-2">
            <SelectValue defaultValue="/" className="bg-background" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {tabs.map((tab) => (
              <SelectItem key={tab.href} value={tab.href} className="text-lg">
                {tab.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
