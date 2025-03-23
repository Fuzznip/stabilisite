"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "next-auth";

export default function NavBarLinks({
  user,
}: {
  user?: User;
}): React.ReactElement {
  const pathname = usePathname();
  const tabs = [
    { href: "/", title: "Home" },
    { href: `/profile/${user?.id}`, title: "Profile" },
    { href: "/leaderboards", title: "Leaderboards" },
  ];

  return (
    <div className="flex items-center ml-12 gap-4">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={`${tab.href}`}
          className={cn(
            "p-2 text-muted-foreground hover:text-foreground",
            tab.href === pathname && "text-primary hover:text-primary"
          )}
        >
          {tab.title}
        </Link>
      ))}
    </div>
  );
}
