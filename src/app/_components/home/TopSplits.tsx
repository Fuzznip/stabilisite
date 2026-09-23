import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { shortAgo } from "@/lib/activity";
import { SplitValue } from "./SplitValue";
import type { Split, User } from "@/lib/types";

/** Big splits deserve more room than a feed row gives them, so this sits
 *  above the activity stream as a highlight rather than folding into it.
 *
 *  One layout at every width: the earlier version rendered a separate
 *  desktop and mobile copy of the same three fields and swapped flex
 *  direction between them, which is what made the spacing look inconsistent.
 *  The value leads the hierarchy here because that is what the list ranks on. */

function TopSplitCard({
  split,
  playerName,
  place,
  now,
}: {
  split: Split;
  playerName?: string;
  place: number;
  now: Date;
}): React.ReactElement {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="shrink-0 rounded-lg bg-accent p-2">
          <div className="relative size-12">
            <Image
              src={split.itemImg}
              alt={split.itemName}
              fill
              sizes="48px"
              className="absolute object-contain"
            />
          </div>
        </div>
        <span
          aria-hidden
          className={cn(
            "text-sm font-bold tabular-nums",
            place === 1 ? "text-stability-accent" : "text-foreground/25",
          )}
        >
          #{place}
        </span>
      </div>

      <SplitValue price={split.itemPrice} className="mt-4 text-3xl" />

      {/* truncate keeps every card the same height when a name runs long. */}
      <span className="mt-1.5 truncate font-semibold text-foreground">
        {split.itemName}
      </span>

      <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-foreground/60">
        <span className="truncate">
          {playerName ? (
            <Link href={`/profile/${playerName}`} className="hover:underline">
              {playerName}
            </Link>
          ) : (
            "Unknown member"
          )}
        </span>
        <span aria-hidden className="text-foreground/25">
          ·
        </span>
        <span className="shrink-0 tabular-nums text-foreground/50">
          {shortAgo(split.date, now)} ago
        </span>
      </span>
    </div>
  );
}

export function TopSplits({
  splits,
  users,
  days,
  now,
}: {
  splits: Split[];
  users: Map<string, User>;
  days: number;
  now: Date;
}): React.ReactElement | null {
  if (splits.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/65">
          Top splits
        </h2>
        <span className="text-xs font-semibold text-foreground/45">
          Last {days} days
        </span>
      </div>

      {/* Three across only from md: at sm the columns are too narrow for a
          long item name to sit beside its value without truncating hard. */}
      <div className="grid gap-4 md:grid-cols-3">
        {splits.map((split, index) => (
          <TopSplitCard
            key={split.id}
            split={split}
            playerName={users.get(split.userId)?.runescapeName}
            place={index + 1}
            now={now}
          />
        ))}
      </div>
    </section>
  );
}
