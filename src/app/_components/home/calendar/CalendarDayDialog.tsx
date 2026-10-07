"use client";

import Image from "next/image";
import { cn, rank_colors } from "@/lib/utils";
import { CLAN_TZ } from "@/lib/calendar/time";
import type { CalendarActivity } from "@/lib/calendar/activity";
import type { CalendarEntry, CalendarItem } from "@/lib/types/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon, PlayerLink } from "../ActivityFeed";
import { SplitValue, formatGp } from "../SplitValue";
import { CalendarChip } from "./CalendarChip";

const TIME: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", timeZone: CLAN_TZ };

function dayLabel(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** A one-line split or promotion inside a day cell. Clicking opens the day. */
export function ActivityChip({
  item,
  onClick,
}: {
  item: CalendarActivity;
  onClick: () => void;
}): React.ReactElement {
  const icon = item.kind === "split" ? item.split.itemImg : `/${item.rank.toLowerCase()}.png`;
  const label =
    item.kind === "split"
      ? `${item.split.itemName} (${formatGp(item.split.itemPrice)}) — ${item.playerName ?? "Unknown member"}`
      : `${item.runescapeName} promoted to ${item.rank}`;
  const rankColor =
    item.kind === "promotion" ? rank_colors.find((entry) => entry.name === item.rank) : undefined;

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex min-h-8 w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-semibold leading-tight text-foreground/80 transition-colors hover:bg-muted"
    >
      <span className="relative size-5 shrink-0">
        <Image
          src={icon}
          alt=""
          fill
          sizes="20px"
          className={cn(
            "absolute object-contain",
            item.kind === "promotion" && "brightness-90 dark:brightness-150",
          )}
        />
      </span>
      <span
        className={cn(
          "min-w-0 truncate",
          rankColor && "brightness-90 dark:brightness-150",
          rankColor?.textColor,
        )}
      >
        {item.kind === "split" ? item.split.itemName : item.runescapeName}
      </span>
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-foreground/50">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ActivityRow({ item }: { item: CalendarActivity }): React.ReactElement {
  const time = (
    <span className="shrink-0 text-xs tabular-nums text-foreground/50">
      {item.date.toLocaleTimeString("en-US", TIME)}
    </span>
  );

  if (item.kind === "split") {
    const { split, playerName } = item;
    return (
      <li className="flex items-center gap-3 px-3 py-2.5">
        <Icon src={split.itemImg} alt={split.itemName} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold">{split.itemName}</span>
          <span className="flex items-center gap-1.5 truncate text-sm text-foreground/60">
            {playerName ? <PlayerLink name={playerName} /> : "Unknown member"}
            <span aria-hidden className="text-foreground/25">
              ·
            </span>
            {time}
          </span>
        </div>
        <SplitValue price={split.itemPrice} className="text-base" />
      </li>
    );
  }

  const rankColor = rank_colors.find((entry) => entry.name === item.rank);
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <Icon
        src={`/${item.rank.toLowerCase()}.png`}
        alt=""
        className="brightness-90 dark:brightness-150"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold">
          Promoted to{" "}
          <span className={cn("capitalize brightness-90 dark:brightness-150", rankColor?.textColor)}>
            {item.rank}
          </span>
        </span>
        <span className="flex items-center gap-1.5 truncate text-sm text-foreground/60">
          <PlayerLink name={item.runescapeName} />
          <span aria-hidden className="text-foreground/25">
            ·
          </span>
          {time}
        </span>
      </div>
    </li>
  );
}

function ActivitySection({
  title,
  items,
}: {
  title: string;
  items: CalendarActivity[];
}): React.ReactElement | null {
  if (items.length === 0) return null;
  return (
    <Section title={title}>
      <ul className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </ul>
    </Section>
  );
}

/** Everything on one day: the events running, then promotions and splits. */
export function CalendarDayDialog({
  day,
  open,
  onOpenChange,
  events,
  activity,
  isAdmin,
  onSelectEntry,
}: {
  /** The ET day shown. */
  day: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: CalendarItem[];
  activity: CalendarActivity[];
  isAdmin: boolean;
  onSelectEntry: (entry: CalendarEntry) => void;
}): React.ReactElement {
  const promotions = activity.filter((item) => item.kind === "promotion");
  const splits = activity
    .filter((item) => item.kind === "split")
    .sort((a, b) => +a.date - +b.date);
  const summary = [
    events.length > 0 && plural(events.length, "event"),
    promotions.length > 0 && plural(promotions.length, "promotion"),
    splits.length > 0 && plural(splits.length, "split"),
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] w-[34rem] max-w-[calc(100%-2rem)] flex-col sm:max-w-[34rem]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">{dayLabel(day)}</DialogTitle>
          <DialogDescription>
            {summary.length > 0 ? summary.join(" · ") : "Nothing on this day."}
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-6 flex min-h-0 flex-col gap-5 overflow-y-auto px-6 pb-1">
          {events.length > 0 && (
            <Section title="Events">
              <div className="flex flex-col gap-1.5">
                {events.map((item) => (
                  <CalendarChip
                    key={item.key}
                    item={item}
                    isAdmin={isAdmin}
                    onSelectEntry={onSelectEntry}
                  />
                ))}
              </div>
            </Section>
          )}
          <ActivitySection title="Promotions" items={promotions} />
          <ActivitySection title="Splits" items={splits} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
