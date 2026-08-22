import { cn } from "@/lib/utils";

/*
 * Every sprite under /collection-log/ui is a real interface sprite pulled out of
 * the game cache by scripts/cache/extract.sh, so sizes are written in game
 * pixels multiplied by --cl-px (1px * --cl-scale). Keep --cl-scale an integer:
 * the sprites are pixel art and only stay crisp at whole multiples.
 *
 * Colours are the client's own — the hex values are the <col=...> tags and
 * colour constants in the CS2 scripts for interface group 621.
 *
 * Class lists must stay literal strings. Tailwind scans source text, so an
 * interpolated or runtime-built class name produces no CSS at all.
 */
export const OSRS_TOKENS = cn(
  // 2x on desktop, 1x on phones, where a 2x panel would not fit.
  "[--cl-scale:1] sm:[--cl-scale:2] [--cl-px:calc(1px*var(--cl-scale))]",
  "[--cl-orange:#ff981f] [--cl-orange-hover:#ffa82f] [--cl-tan:#ff9040]",
  "[--cl-green:#0dc10d] [--cl-yellow:#ffff00] [--cl-red:#ff0000]",
  "[--cl-white:#f4f4f4]",
  // Darkest and lightest pixels of the frame strips, for bevelled edges.
  "[--cl-bevel-dark:#0e0e0c] [--cl-bevel-light:#535451]",
  // The tab sprites' own bevel line (top row of 2283-2286).
  "[--cl-tab-border:#5d5848]"
);

/** Widest a panel gets, so it doesn't sprawl on ultrawide displays. */
export const PANEL_MAX_WIDTH = "max-w-[calc(900*var(--cl-px))]";

const CORNER = cn(
  "absolute pointer-events-none z-2 bg-no-repeat [background-size:100%_100%]",
  "w-[calc(25*var(--cl-px))] h-[calc(30*var(--cl-px))]"
);

/*
 * Edges tile between the corners. The 36px strips rarely divide evenly into the
 * window and a clipped final tile is very visible, so each edge tiles from the
 * start and then repeats the strip once more, flush to the far end, as an
 * ::after. That's what the client does — group 285 steps tiles by 36 (...384,
 * 420) and then places the last one at 428, overlapping its neighbour.
 */
const EDGE_H = cn(
  "absolute pointer-events-none bg-repeat-x",
  "left-[calc(25*var(--cl-px))] right-[calc(25*var(--cl-px))]",
  "h-[calc(6*var(--cl-px))] [background-size:calc(36*var(--cl-px))_100%]",
  'after:content-[""] after:absolute after:top-0 after:right-0 after:h-full',
  "after:w-[calc(36*var(--cl-px))] after:bg-no-repeat",
  "after:[background-size:100%_100%]"
);

const EDGE_V = cn(
  "absolute pointer-events-none bg-repeat-y",
  "top-[calc(30*var(--cl-px))] bottom-[calc(30*var(--cl-px))]",
  "w-[calc(6*var(--cl-px))] [background-size:100%_calc(36*var(--cl-px))]",
  'after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-full',
  "after:h-[calc(36*var(--cl-px))] after:bg-no-repeat",
  "after:[background-size:100%_100%]"
);

/** The same frame strip used as a horizontal rule inside a panel. */
export const PANEL_RULE = cn(
  "relative shrink-0 h-[calc(6*var(--cl-px))] bg-repeat-x",
  "bg-[url(/collection-log/ui/frame-b.png)]",
  "[background-size:calc(36*var(--cl-px))_100%]",
  'after:content-[""] after:absolute after:top-0 after:right-0',
  "after:h-full after:w-[calc(36*var(--cl-px))] after:bg-no-repeat",
  "after:bg-[url(/collection-log/ui/frame-b.png)]",
  "after:[background-size:100%_100%]"
);

/**
 * An OSRS interface window: the stone frame drawn from cache sprites, filled
 * with the tiled panel background (sprite 297, as interface group 285 does).
 */
export function OsrsPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  /** Applied to the window body — use it to set the panel's height. */
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn("font-osrs w-full [image-rendering:pixelated]", OSRS_TOKENS)}>
      <div className="relative p-[calc(6*var(--cl-px))]">
        <span
          aria-hidden
          className={cn(CORNER, "top-0 left-0 bg-[url(/collection-log/ui/frame-tl.png)]")}
        />
        <span
          aria-hidden
          className={cn(CORNER, "top-0 right-0 bg-[url(/collection-log/ui/frame-tr.png)]")}
        />
        <span
          aria-hidden
          className={cn(CORNER, "bottom-0 left-0 bg-[url(/collection-log/ui/frame-bl.png)]")}
        />
        <span
          aria-hidden
          className={cn(CORNER, "bottom-0 right-0 bg-[url(/collection-log/ui/frame-br.png)]")}
        />
        <span
          aria-hidden
          className={cn(
            EDGE_H,
            "top-0 bg-[url(/collection-log/ui/frame-t.png)]",
            "after:bg-[url(/collection-log/ui/frame-t.png)]"
          )}
        />
        <span
          aria-hidden
          className={cn(
            EDGE_H,
            "bottom-0 bg-[url(/collection-log/ui/frame-b.png)]",
            "after:bg-[url(/collection-log/ui/frame-b.png)]"
          )}
        />
        <span
          aria-hidden
          className={cn(
            EDGE_V,
            "left-0 bg-[url(/collection-log/ui/frame-l.png)]",
            "after:bg-[url(/collection-log/ui/frame-l.png)]"
          )}
        />
        <span
          aria-hidden
          className={cn(
            EDGE_V,
            "right-0 bg-[url(/collection-log/ui/frame-r.png)]",
            "after:bg-[url(/collection-log/ui/frame-r.png)]"
          )}
        />

        <div
          className={cn(
            "flex flex-col w-full",
            PANEL_MAX_WIDTH,
            "bg-[url(/collection-log/ui/bg.png)] bg-repeat",
            "[background-size:calc(88*var(--cl-px))_calc(60*var(--cl-px))]",
            "text-[length:calc(16px*var(--cl-scale))] leading-[calc(16*var(--cl-px))]",
            "text-[var(--cl-orange)] [text-shadow:var(--cl-px)_var(--cl-px)_0_#000]",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
