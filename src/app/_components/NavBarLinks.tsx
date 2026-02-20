"use client";

import { User } from "@/lib/types";
import { Event } from "@/lib/types/v2";
import { cn } from "@/lib/utils";
import {
  Home,
  User as UserIcon,
  Trophy,
  FileText,
  Grid3X3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const iconMap: Record<string, React.ElementType> = {
  Home: Home,
  Profile: UserIcon,
  Leaderboards: Trophy,
  Applications: FileText,
  Bingo: Grid3X3,
};

export default function NavBarLinks({
  user,
  event,
}: {
  user: User | null;
  event?: Event;
}): React.ReactElement {
  const pathname = usePathname();
  const tabs = [
    { href: "/", title: "Home" },
    { href: `/profile/${user?.discordId}`, title: "Profile" },
    { href: "/leaderboards", title: "Leaderboards" },
  ];

  if (user?.isAdmin) {
    tabs.push({ href: "/applications", title: "Applications" });
  }

  if (event) {
    tabs.push({ href: `/bingo/${event.id}`, title: "Bingo" });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop: Horizontal links */}
      <div className="items-center ml-8 gap-4 hidden md:flex">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "p-2 pb-1 text-muted-foreground hover:text-foreground font-bold relative",
                active && "text-stability hover:text-stability",
              )}
            >
              {tab.title}
              {active && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-1 bg-stability rounded-full"
                  style={{ boxShadow: "0 0 8px rgba(165, 45, 42, 0.6)" }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile: Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]"
        style={{ minHeight: "4rem" }}
      >
        <div className="flex justify-around items-center h-full px-2">
          {tabs.map((tab) => {
            const Icon = iconMap[tab.title] || Home;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex-1 max-w-[100px] flex flex-col items-center justify-center gap-1",
                  "px-2 py-2 rounded-md relative",
                  "transition-all duration-200 ease-out",
                  "active:scale-95",
                  active
                    ? "text-stability"
                    : "text-muted-foreground active:bg-accent/50",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold tracking-wide uppercase">
                  {tab.title}
                </span>
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-stability rounded-full animate-in slide-in-from-bottom-2 duration-200"
                    style={{ boxShadow: "0 0 8px rgba(165, 45, 42, 0.6)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
