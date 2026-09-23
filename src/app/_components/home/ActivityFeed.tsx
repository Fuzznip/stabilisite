import Image from "next/image";
import Link from "next/link";
import { cn, getScaleDisplay, rank_colors } from "@/lib/utils";
import { shortAgo, type ActivityItem } from "@/lib/activity";
import { SplitValue } from "./SplitValue";
import type { DiaryApplication } from "@/lib/types";

/** Each kind gets a dot from the same palette the events pages use, so the
 *  feed reads as part of the same system rather than a third colour scheme. */
const KIND_DOT: Record<ActivityItem["kind"], string> = {
  split: "bg-event-botw",
  diary: "bg-event-bingo",
  promotion: "bg-stability",
};

const KIND_LABEL: Record<ActivityItem["kind"], string> = {
  split: "Split",
  diary: "Achievement",
  promotion: "Promotion",
};

/** Combat Achievements get the combat icon; everything else the diary one. */
function diaryIcon(diary: DiaryApplication): string {
  return diary.name === "Combat Achievements" ? "/combat.png" : "/diary.png";
}

function PlayerLink({ name }: { name: string }): React.ReactElement {
  return (
    <Link href={`/profile/${name}`} className="hover:underline">
      {name}
    </Link>
  );
}

function Icon({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}): React.ReactElement {
  return (
    <div className="shrink-0 rounded-lg bg-accent p-1.5">
      <div className="relative size-8">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="32px"
          className={cn("absolute object-contain", className)}
        />
      </div>
    </div>
  );
}

function Row({
  item,
  now,
}: {
  item: ActivityItem;
  now: Date;
}): React.ReactElement {
  return (
    <li className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-accent/40 sm:gap-4 sm:px-4">
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full", KIND_DOT[item.kind])}
      />
      <RowBody item={item} now={now} />
    </li>
  );
}

function RowBody({
  item,
  now,
}: {
  item: ActivityItem;
  now: Date;
}): React.ReactElement {
  const time = (
    <span className="w-10 shrink-0 text-right text-xs tabular-nums text-foreground/50">
      {shortAgo(item.date, now)}
    </span>
  );

  const kind = (
    <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground/45">
      {KIND_LABEL[item.kind]}
    </span>
  );

  if (item.kind === "split") {
    const { split, playerName } = item;
    return (
      <>
        <Icon src={split.itemImg} alt={split.itemName} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold text-foreground">
            {split.itemName}
          </span>
          <span className="flex items-center gap-1.5 truncate text-sm text-foreground/60">
            {playerName ? <PlayerLink name={playerName} /> : "Unknown member"}
            <span aria-hidden className="text-foreground/25">
              ·
            </span>
            {kind}
          </span>
        </div>
        <SplitValue price={split.itemPrice} className="text-lg" />
        {time}
      </>
    );
  }

  if (item.kind === "diary") {
    const { diary } = item;
    const scale = getScaleDisplay(diary.shorthand?.replace(/\D/g, "") || "1");
    const party = [...(diary.party ?? [])].sort((a, b) => a.localeCompare(b));
    return (
      <>
        <Icon src={diaryIcon(diary)} alt="" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold text-foreground">
            {scale && diary.name === "Combat Achievements" && (
              <span className="mr-1.5 capitalize">{diary.shorthand}</span>
            )}
            {diary.name}
            {scale && diary.time && (
              <span className="ml-1.5 font-normal text-foreground/50">
                ({scale})
              </span>
            )}
          </span>
          <span className="flex items-center gap-1.5 truncate text-sm text-foreground/60">
            <span className="truncate capitalize">
              {party.map((member, index) => (
                <span key={member}>
                  <PlayerLink name={member} />
                  {index < party.length - 1 && ", "}
                </span>
              ))}
            </span>
            <span aria-hidden className="text-foreground/25">
              ·
            </span>
            {kind}
          </span>
        </div>
        {diary.time && (
          <span className="shrink-0 text-lg font-bold tabular-nums text-foreground">
            {diary.time}
          </span>
        )}
        {time}
      </>
    );
  }

  const rankColor = rank_colors.find((entry) => entry.name === item.rank);
  return (
    <>
      <Icon
        src={`/${item.rank.toLowerCase()}.png`}
        alt=""
        className="brightness-90 dark:brightness-150"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold text-foreground">
          Promoted to{" "}
          <span
            className={cn(
              "capitalize brightness-90 dark:brightness-150",
              rankColor?.textColor,
            )}
          >
            {item.rank}
          </span>
        </span>
        <span className="flex items-center gap-1.5 truncate text-sm text-foreground/60">
          <PlayerLink name={item.runescapeName} />
          <span aria-hidden className="text-foreground/25">
            ·
          </span>
          {kind}
        </span>
      </div>
      {time}
    </>
  );
}

export function ActivityFeed({
  items,
  now,
}: {
  items: ActivityItem[];
  now: Date;
}): React.ReactElement | null {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/65">
          Recent activity
        </h2>
        <Link
          href="/leaderboards"
          className="text-xs font-semibold text-foreground/60 hover:text-foreground hover:underline"
        >
          Leaderboards →
        </Link>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {items.map((item) => (
          <Row key={item.id} item={item} now={now} />
        ))}
      </ul>
    </section>
  );
}
