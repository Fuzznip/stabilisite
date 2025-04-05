"use client";

import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBarLinks({
  user,
}: {
  user: User | null;
}): React.ReactElement {
  const pathname = usePathname();
  const tabs = [
    // { href: "/", title: "Home" },
    { href: `/profile/${user?.discordId}`, title: "Profile" },
    { href: "/leaderboards", title: "Leaderboards" },
  ];

  if (user?.isAdmin)
    tabs.push({ href: "/applications", title: "Applications" });

  return (
    <div className="flex items-center ml-8 gap-4">
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
  );
}
