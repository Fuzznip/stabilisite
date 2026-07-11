import { cn } from "@/lib/utils";

interface PointsBadgeProps {
  points: number;
  /** "xs" for dense table headers, "sm" (default) for card/name rows */
  size?: "xs" | "sm";
  /** Dim the badge for a value that isn't currently earned (e.g. an uncontrolled region). */
  muted?: boolean;
  className?: string;
}

/**
 * Small pill showing how many conquest points a territory/region is worth.
 * Rendered next to a territory or region name so its value is always visible.
 */
export function PointsBadge({
  points,
  size = "sm",
  muted = false,
  className,
}: PointsBadgeProps) {
  return (
    <span
      title={`Worth ${points} ${points === 1 ? "point" : "points"}`}
      className={cn(
        "inline-flex items-baseline gap-0.5 shrink-0 rounded-md font-mono font-semibold tabular-nums leading-none",
        muted ? "text-white/40" : "text-white",
        size === "xs"
          ? "px-1 py-0.5 text-xs sm:px-1.5 sm:py-1 sm:text-base"
          : "px-1.5 py-0.5 text-xs sm:px-2 sm:py-1 sm:text-lg",
        className,
      )}
      style={
        muted
          ? {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.15)",
            }
          : {
              background: "hsl(var(--stability) / 0.08)",
              border: "1px solid hsl(var(--stability))",
            }
      }
    >
      {points}
      <span className="font-normal opacity-70">pts</span>
    </span>
  );
}
