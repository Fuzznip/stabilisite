import { REGION_GROUPS, REGION_COLORS } from "./map-data";

export function MapLegend() {
  return (
    <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 justify-center max-w-4xl mx-auto text-xs text-muted-foreground mt-3">
      {REGION_GROUPS.map((group, i) => (
        <span key={group.key} className="inline-flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full inline-block shrink-0"
            style={{ background: `rgb(${REGION_COLORS[i].join(",")})` }}
          />
          {group.displayName}
        </span>
      ))}
    </div>
  );
}
