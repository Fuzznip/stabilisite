"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", title: "Home" },
  { href: "/profile", title: "Profile" },
  { href: "/leaderboards", title: "Leaderboards" },
];

export default function NavBarLinks(): React.ReactElement {
  const pathname = usePathname();

  console.log("check: ", pathname, tabs[0].href);

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
