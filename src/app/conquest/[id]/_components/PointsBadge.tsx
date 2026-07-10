import { cn } from "@/lib/utils";

interface PointsBadgeProps {
  points: number;
  /** "xs" for dense table headers, "sm" (default) for card/name rows */
  size?: "xs" | "sm";
  className?: string;
}

/**
 * Small gold pill showing how many conquest points a territory/region is worth.
 * Rendered next to a territory or region name so its value is always visible.
 */
export function PointsBadge({ points, size = "sm", className }: PointsBadgeProps) {
  return (
    <span
      title={`Worth ${points} ${points === 1 ? "point" : "points"}`}
      className={cn(
        "inline-flex items-baseline gap-0.5 shrink-0 rounded-md font-mono font-semibold tabular-nums leading-none text-white",
        size === "xs" ? "px-1 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-xs",
        className,
      )}
      style={{
        background: "hsl(var(--stability) / 0.08)",
        border: "1px solid hsl(var(--stability))",
      }}
    >
      {points}
      <span className="font-normal opacity-70">pts</span>
    </span>
  );
}
