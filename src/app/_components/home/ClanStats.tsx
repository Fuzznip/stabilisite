"use client";

import Image from "next/image";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { cn } from "@/lib/utils";

/** Client-side only because NumberTicker animates on scroll-into-view.
 *  Everything it receives is a plain number — no Dates cross this boundary. */

type Stat = {
  label: string;
  value: number;
  suffix?: string;
  decimalPlaces?: number;
  /** A GP figure: gets the coin icon and the split-highlight colour, so it
   *  reads the same as every other GP amount on the page. */
  gp?: boolean;
};

/** Split values run into the hundreds of billions, which is unreadable as a
 *  raw integer. Scale to b/m and keep one decimal so the number still moves. */
function scaleGp(value: number): { value: number; suffix: string } {
  if (value >= 1_000_000_000) {
    return { value: value / 1_000_000_000, suffix: "b" };
  }
  return { value: value / 1_000_000, suffix: "m" };
}

export function ClanStats({
  memberCount,
  achievementCount,
  splitValue,
}: {
  memberCount: number;
  achievementCount: number;
  splitValue: number;
}): React.ReactElement {
  const gp = scaleGp(splitValue);

  const stats: Stat[] = [
    { label: "Members", value: memberCount },
    {
      label: "Total Split value",
      value: gp.value,
      suffix: gp.suffix,
      decimalPlaces: 1,
      gp: true,
    },
    { label: "Achievements", value: achievementCount },
  ];

  return (
    <dl className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-1 px-6 py-5"
        >
          <dd
            className={cn(
              "flex items-center gap-2 text-3xl font-bold sm:text-4xl",
              stat.gp ? "text-split-highlight" : "text-foreground",
            )}
          >
            {stat.gp && (
              // Sized in em so it tracks the tile's responsive font size.
              <span className="relative size-[1em] shrink-0">
                <Image
                  src="/coins.png"
                  alt=""
                  fill
                  sizes="40px"
                  className="absolute object-contain"
                />
              </span>
            )}
            <span className="flex items-baseline">
              <NumberTicker
                value={stat.value}
                decimalPlaces={stat.decimalPlaces ?? 0}
                // NumberTicker hard-codes `text-black dark:text-white`. The
                // dark variant needs overriding explicitly — an unprefixed
                // colour alone loses to it in dark mode.
                className={cn(
                  stat.gp
                    ? "text-split-highlight dark:text-split-highlight"
                    : "text-foreground dark:text-foreground",
                )}
              />
              {stat.suffix && <span>{stat.suffix}</span>}
            </span>
          </dd>
          <dt className="text-[11px] font-bold uppercase tracking-widest text-foreground/55">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
