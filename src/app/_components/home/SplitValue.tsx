import Image from "next/image";
import { cn } from "@/lib/utils";

/** The GP figure for a split, wherever it appears on the homepage: coin icon,
 *  formatted amount, and the "big split" highlight. Shared by the activity
 *  feed and the top-splits cards so the two can't drift apart on rounding or
 *  on where the threshold sits. */

/** The cutoff the homepage has always used to call a split big. */
const BIG_SPLIT = 10_000_000;

export function formatGp(price: number): string {
  if (price >= 1_000_000_000) {
    // Trim trailing zeros so 1b reads "1b", not "1.00b".
    return `${(price / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}b`;
  }
  return `${Math.floor(price / 1_000_000)}m`;
}

export function SplitValue({
  price,
  className,
}: {
  price: number;
  className?: string;
}): React.ReactElement {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1.5 font-bold tabular-nums",
        price >= BIG_SPLIT ? "text-split-highlight" : "text-foreground",
        className,
      )}
    >
      {/* Decorative: the amount beside it already carries the meaning.
          Sized in em so one component works at both the feed's text-lg and
          the top-splits cards' text-2xl without a size prop. */}
      <span className="relative size-[1em] shrink-0">
        <Image
          src="/coins.png"
          alt=""
          fill
          sizes="24px"
          className="absolute object-contain"
        />
      </span>
      {formatGp(price)}
    </span>
  );
}
