"use client";

import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Home,
  User as UserIcon,
  Trophy,
  FileText,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const iconMap: Record<string, React.ElementType> = {
  Home: Home,
  Profile: UserIcon,
  Leaderboards: Trophy,
  Applications: FileText,
  Events: CalendarDays,
};

/** Event pages live under their own type-specific route, so the Events tab has
 *  to stay highlighted while the user is on any of them. */
const EVENT_ROUTES = ["/events", "/conquest", "/bingo", "/botw"];

export default function NavBarLinks({
  user,
}: {
  user: User | null;
}): React.ReactElement {
  const pathname = usePathname();
  const tabs = [
    { href: "/", title: "Home" },
    { href: `/profile/${user?.discordId}`, title: "Profile" },
    { href: "/leaderboards", title: "Leaderboards" },
    { href: "/events", title: "Events" },
  ];

  if (user?.isAdmin) {
    tabs.push({ href: "/applications", title: "Applications" });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/events") {
      return EVENT_ROUTES.some((route) => pathname.startsWith(route));
    }
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
                active && "text-stability-accent hover:text-stability-accent",
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
                    ? "text-stability-accent"
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
