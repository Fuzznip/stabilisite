export interface Territory {
  id: string;      // UUID — matches ConquestTerritory.id once DB UUIDs are substituted
  index: number;   // 1-based; matches the red channel value in the label PNG
  name: string;
  size: number;
  cx: number;
  cy: number;
}

export interface RegionData {
  name: string;
  region_id: string;
  filename: string;
  label_filename: string;
  imageWidth: number;
  imageHeight: number;
  offsetX: number;
  offsetY: number;
  territories: Territory[];
}

export interface OverlayBuffer {
  name: string;
  imageWidth: number;
  imageHeight: number;
  offsetX: number;
  offsetY: number;
  hoverData: ImageData;
  borderData: ImageData;
  territoryPixels: Record<number, number[]>;   // keyed by territory index (1-based)
  innerBorderPixels: Record<number, number[]>; // keyed by territory index (1-based)
  labelData: Uint8Array; // red channel of label PNG: labelData[pi] = territory index (0=sea)
}

export interface HoverState {
  regionName: string;
  label: number; // territory index (1-based)
}

export interface HoverInfo {
  regionDisplayName: string;
  territoryName: string;
  territoryId: string;
}
