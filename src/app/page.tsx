import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import {
  getSplitsPaginated,
  getTopRecentSplits,
  type PaginatedResponse,
} from "@/lib/fetch/getSplits";
import { getTotalSplitValue } from "@/lib/fetch/getClanStats";
import { getDiaryApplicationsPaginated } from "@/lib/db/diary";
import { getRankApplications } from "@/lib/db/rank";
import { getEvents } from "@/lib/fetch/getBingo";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import getUsers from "@/lib/fetch/getUsers";
import { buildActivityFeed, usersByDiscordId } from "@/lib/activity";
import { canViewEvent, eventPhase } from "@/lib/events";
import { LiveEvent, UpcomingEvent } from "@/components/events/EventCards";
import { HomeHero } from "./_components/home/HomeHero";
import { ClanStats } from "./_components/home/ClanStats";
import { ActivityFeed } from "./_components/home/ActivityFeed";
import { TopSplits } from "./_components/home/TopSplits";
import type { DiaryApplication, Split } from "@/lib/types";
import type { Event } from "@/lib/types/v2";

export const metadata: Metadata = {
  description:
    "Stability — an Old School RuneScape raiding and PvM clan. Recent splits, achievements, promotions and events.",
};

// Dynamic by necessity: the hero branches on the session, and `now` drives
// every relative time and event phase below. The expensive clan-wide split
// aggregate is cached inside getSplitTotals() rather than here.

/** How many rows the merged feed shows. Each source is over-fetched a little
 *  so one busy category can't crowd the others out of the merge. */
const FEED_LENGTH = 12;

/** The "top splits" highlight window, and how many make the cut. */
const TOP_SPLIT_DAYS = 30;
const TOP_SPLIT_COUNT = 3;

/** A failing endpoint should cost its own section, not the whole homepage.
 *  Next signals redirects, notFound() and dynamic-API usage by throwing, so
 *  those have to be rethrown — swallowing them would quietly break the
 *  framework's own control flow (and did: it turned the dynamic-usage signal
 *  into a bogus "fetch failed" log line during the build). */
function orElse<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return promise.catch((error) => {
    unstable_rethrow(error);
    console.error("[home] fetch failed:", error);
    return fallback;
  });
}

function emptyPage<T>(): PaginatedResponse<T> {
  return {
    items: [],
    page: 1,
    per_page: 0,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false,
  };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/65">
      {children}
    </h2>
  );
}

function EventStrip({
  events,
  isAdmin,
  now,
}: {
  events: Event[];
  isAdmin: boolean | null | undefined;
  now: Date;
}): React.ReactElement | null {
  // Filtered before bucketing so a hidden event can't leak through an
  // emptiness check, matching how /events does it.
  const visible = events.filter((event) => canViewEvent(event, isAdmin));

  const active = visible
    .filter((event) => eventPhase(event, now) === "active")
    .sort((a, b) => +new Date(a.end_date) - +new Date(b.end_date));

  const upcoming = visible
    .filter((event) => eventPhase(event, now) === "upcoming")
    .sort((a, b) => +new Date(a.start_date) - +new Date(b.start_date));

  if (active.length === 0 && upcoming.length === 0) return null;

  // A running event is the headline; upcoming ones only take the stage when
  // nothing is live.
  const showing = active.length > 0 ? active : upcoming.slice(0, 3);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <SectionHeading>
          {active.length > 0 ? "Happening now" : "Coming up"}
        </SectionHeading>
        <Link
          href="/events"
          className="text-xs font-semibold text-foreground/60 hover:text-foreground hover:underline"
        >
          All events →
        </Link>
      </div>

      {active.length > 0 ? (
        <div className="flex flex-col gap-4">
          {showing.map((event) => (
            <LiveEvent key={event.id} event={event} now={now} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showing.map((event) => (
            <UpcomingEvent key={event.id} event={event} now={now} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function HomePage(): Promise<React.ReactElement> {
  const [
    user,
    splitsData,
    diariesData,
    promotions,
    events,
    users,
    totalSplitValue,
    topSplits,
  ] = await Promise.all([
      orElse(getAuthUser(), null),
      orElse(getSplitsPaginated(1, FEED_LENGTH), emptyPage<Split>()),
      orElse(
        getDiaryApplicationsPaginated(1, FEED_LENGTH, "Accepted"),
        emptyPage<DiaryApplication>(),
      ),
      orElse(getRankApplications(), []),
      orElse(getEvents(), []),
      orElse(getUsers(), []),
      orElse(getTotalSplitValue(), 0),
      orElse(getTopRecentSplits(TOP_SPLIT_DAYS, TOP_SPLIT_COUNT), []),
    ]);

  const now = new Date();
  const userMap = usersByDiscordId(users);

  const feed = buildActivityFeed(
    {
      splits: splitsData.items ?? [],
      diaries: diariesData.items ?? [],
      promotions: promotions ?? [],
      users: userMap,
    },
    FEED_LENGTH,
  );

  const memberCount = (users ?? []).filter((member) => member.isMember).length;

  return (
    <div className="flex flex-col gap-12 pb-12">
      <HomeHero user={user} />

      <ClanStats
        memberCount={memberCount}
        achievementCount={diariesData.total ?? 0}
        splitValue={totalSplitValue}
      />

      <EventStrip events={events ?? []} isAdmin={user?.isAdmin} now={now} />

      <TopSplits
        splits={topSplits}
        users={userMap}
        days={TOP_SPLIT_DAYS}
        now={now}
      />

      <ActivityFeed items={feed} now={now} />
    </div>
  );
}
