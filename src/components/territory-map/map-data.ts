export const CANVAS_WIDTH = 459;
export const CANVAS_HEIGHT = 211;
export const BACKGROUND_COLOR = "#6b6466";
export const MAP_PATH_PREFIX = "/map/";
// Slightly lighter/warmer than the background — used for outer territory borders
export const BORDER_COLOR: [number, number, number] = [210, 205, 198];

// Regions that share a territory ID space across two PNGs
export const GROUPS: Record<string, string> = {
  misthalin: "misthalin_wilderness",
  wilderness: "misthalin_wilderness",
  karamja: "kandarin",
};

export interface RegionGroup {
  key: string;
  displayName: string;
}

// 9 unique groups, ordered to match REGION_COLORS
export const REGION_GROUPS: RegionGroup[] = [
  { key: "asgarnia", displayName: "Asgarnia" },
  { key: "fremennik", displayName: "Fremennik" },
  { key: "misthalin_wilderness", displayName: "Misthalin & Wilderness" },
  { key: "kandarin", displayName: "Kandarin & Karamja" },
  { key: "desert", displayName: "Desert" },
  { key: "tirannwn", displayName: "Tirannwn" },
  { key: "morytania", displayName: "Morytania" },
  { key: "kourend", displayName: "Kourend" },
  { key: "varlamore", displayName: "Varlamore" },
];

export const REGION_COLORS: [number, number, number][] = [
  [230, 25, 75],   // karamja_asgarnia — red
  [60, 180, 75],   // fremennik — green
  [255, 225, 25],  // misthalin_wilderness — yellow
  [67, 99, 216],   // kandarin — blue
  [245, 130, 49],  // desert — orange
  [145, 30, 180],  // tirannwn — purple
  [66, 212, 244],  // morytania — cyan
  [240, 50, 230],  // kourend — magenta
  [191, 239, 69],  // varlamore — lime
];

// Fallback fill colors cycled by territory index when no team owns the territory
export const TERR_COLORS: [number, number, number][] = [
  [59, 130, 246],
  [34, 197, 94],
  [239, 68, 68],
  [234, 179, 8],
  [168, 85, 247],
  [249, 115, 22],
  [6, 182, 212],
  [236, 72, 153],
];

export function getGroupKey(regionName: string): string {
  return GROUPS[regionName] ?? regionName;
}

export function getGroupDisplayName(regionName: string): string {
  const key = getGroupKey(regionName);
  return REGION_GROUPS.find((g) => g.key === key)?.displayName ?? regionName;
}

export function getRegionColor(regionName: string): [number, number, number] {
  const key = getGroupKey(regionName);
  const idx = REGION_GROUPS.findIndex((g) => g.key === key);
  return idx >= 0 ? REGION_COLORS[idx] : [128, 128, 128];
}

export function getTerritoryColor(
  territoryIndex: number
): [number, number, number] {
  return TERR_COLORS[(territoryIndex - 1) % TERR_COLORS.length];
}

/** Parse a CSS hex color string (#rrggbb or #rgb) to an RGB tuple. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
