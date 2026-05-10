import type { HoverInfo } from "./types";

export function MapTooltip({
  hover,
  mousePos,
}: {
  hover: HoverInfo | null;
  mousePos: { x: number; y: number };
}) {
  if (!hover) return null;
  return (
    <div
      className="fixed pointer-events-none z-50 bg-stone-900/90 border border-amber-600 rounded px-3 py-1.5 shadow-lg"
      style={{ left: mousePos.x + 14, top: mousePos.y - 10 }}
    >
      <div className="text-stone-400 text-[0.7rem]">{hover.regionDisplayName}</div>
      <div className="text-amber-500 font-semibold text-[0.78rem] tracking-wide">
        {hover.territoryName}
      </div>
    </div>
  );
}
