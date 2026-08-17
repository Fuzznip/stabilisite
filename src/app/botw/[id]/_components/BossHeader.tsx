"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Package, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { countdownLabel } from "@/lib/events";
import type { BotwBoss, BotwChallenge, Event } from "@/lib/types/v2";

function pointsLabel(points: number): string {
  return `${points} ${points === 1 ? "pt" : "pts"}`;
}

function formatRange(event: Event): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  const sameYear = start.getFullYear() === end.getFullYear();
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString(
    "en-US",
    sameYear ? opts : { ...opts, year: "numeric" },
  )}${sameYear ? `, ${end.getFullYear()}` : ""}`;
}

/**
 * Boss icon: the icon uploaded to S3, or a generic glyph. `onError` still
 * covers the case where the stored URL 404s.
 *
 * Framed rather than bare — boss icons are transparent PNGs, and at this size
 * an unframed one reads as floating on the page instead of sitting in a slot.
 */
function BossImage({ boss, className }: { boss: BotwBoss; className?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn(
        "relative shrink-0 rounded-xl border border-border/60 bg-foreground/[0.03]",
        className,
      )}
    >
      {boss.image_url && !failed ? (
        <Image
          src={boss.image_url}
          alt={boss.name}
          fill
          sizes="(min-width: 1024px) 176px, 112px"
          unoptimized
          className="object-contain p-3"
          onError={() => setFailed(true)}
        />
      ) : (
        <Swords className="absolute inset-0 m-auto size-1/3 text-foreground/30" />
      )}
    </span>
  );
}

/**
 * One scoring line: the boss's kill rate or one of its drops.
 *
 * The value is a filled pill rather than red text. Brand red as small text on
 * this chip measures 4.39:1 — under the 4.5:1 AA floor — while white on
 * --stability is 5.99:1, and it matches the count badges on the leaderboard.
 */
function ChallengeChip({
  challenge,
  label,
  imgSrc,
  highlight,
}: {
  challenge: BotwChallenge;
  label?: string;
  /** Overrides the trigger's own icon — the kill line shows the boss. */
  imgSrc?: string | null;
  highlight?: boolean;
}) {
  const { trigger, value } = challenge;
  const [failed, setFailed] = useState(false);
  const src = imgSrc ?? trigger.img_path;

  return (
    <li
      className={cn(
        // min-w-0 on the grid item itself: a grid item's automatic minimum is
        // its min-content size, and `truncate` sets white-space: nowrap, so
        // without this the chip refuses to shrink below the untruncated name
        // and pushes its points pill outside the card.
        "flex min-w-0 items-center gap-2.5 rounded-md px-3 py-2",
        highlight
          ? "bg-stability/[0.07] border border-stability/30"
          : "bg-foreground/[0.03] border border-transparent",
      )}
    >
      <span className="relative size-12 shrink-0">
        {src && !failed ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="48px"
            className="object-contain"
            unoptimized
            onError={() => setFailed(true)}
          />
        ) : (
          <Package className="absolute inset-0 m-auto size-6 text-foreground/40" />
        )}
      </span>

      {/* Titled because a long drop name (e.g. "Executioner's axe head") still
          truncates in a three-column layout, and the chip has no other way to
          reveal it. */}
      <span
        title={label ?? trigger.name}
        className="min-w-0 flex-1 truncate text-base text-foreground/90"
      >
        {label ?? trigger.name}
      </span>

      <span className="shrink-0 rounded-full bg-stability px-2 py-0.5 text-sm font-bold tabular-nums text-white">
        {pointsLabel(value)}
      </span>
    </li>
  );
}

/** Every way one boss scores: its kill rate first, then its drops by value. */
function BossScoring({ boss, showName }: { boss: BotwBoss; showName: boolean }) {
  const kc = boss.challenges.find((c) => c.trigger.type === "KC");
  const drops = boss.challenges
    .filter((c) => c.trigger.type === "DROP")
    .sort(
      (a, b) =>
        b.value - a.value || a.trigger.name.localeCompare(b.trigger.name),
    );

  if (!kc && drops.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {showName && (
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/65">
          {boss.name}
        </h3>
      )}
      <ul className="grid gap-2 @md/lines:grid-cols-2 @3xl/lines:grid-cols-3">
        {/* Kill rate leads: it is the one line that scores on every kill. */}
        {kc && (
          <ChallengeChip
            challenge={kc}
            label="Per kill"
            imgSrc={boss.image_url}
            highlight
          />
        )}
        {drops.map((challenge) => (
          <ChallengeChip key={challenge.id} challenge={challenge} />
        ))}
      </ul>
    </div>
  );
}

/**
 * The page's header: what the boss is, when it runs, and — on request — how it
 * scores.
 *
 * The scoring breakdown is collapsed by default and opens directly above the
 * leaderboard. Someone arriving mid-event wants the standings, and an
 * always-open breakdown pushes them down the page; someone deciding what to
 * farm opens it once.
 */
export function BossHeader({
  event,
  bosses,
}: {
  event: Event;
  bosses: BotwBoss[];
}) {
  const [open, setOpen] = useState(false);

  // With a single boss the event *is* that boss, so it supplies the title and
  // the image. Multi-boss events fall back to the event's own name and list
  // each boss inside the breakdown instead.
  const single = bosses.length === 1 ? bosses[0] : null;
  const title = single?.name ?? event.name;
  const hasScoring = bosses.some((b) => b.challenges.length > 0);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="flex flex-col gap-4"
    >
      <div className="flex items-start gap-5">
        {single && (
          <BossImage boss={single} className="size-28 sm:size-36 lg:size-44" />
        )}

        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/65">
            Boss of the Week
          </p>
          <h1 className="text-4xl font-bold text-foreground">{title}</h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-base text-foreground/70">
              {formatRange(event)}
            </span>
            {/* Hidden on a phone, where the countdown always wraps to its own
                line and the separator would dangle at the end of the date. */}
            <span aria-hidden className="hidden text-foreground/25 sm:inline">
              ·
            </span>
            <span className="text-base font-semibold text-foreground/80">
              {countdownLabel(event)}
            </span>
          </div>

          {hasScoring ? (
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="mt-3 self-start">
                {open ? "Hide point breakdown" : "See point breakdown"}
                <ChevronDown
                  className={cn("transition-transform", open && "rotate-180")}
                />
              </Button>
            </CollapsibleTrigger>
          ) : (
            <p className="mt-3 text-sm text-foreground/60">
              No scoring configured yet.
            </p>
          )}
        </div>
      </div>

      <CollapsibleContent>
        <div className="@container/lines flex flex-col gap-5 rounded-xl border border-border bg-card p-5">
          {bosses.map((boss) => (
            <BossScoring
              key={boss.id}
              boss={boss}
              showName={bosses.length > 1}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
