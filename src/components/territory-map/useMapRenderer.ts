"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RegionData, OverlayBuffer, HoverState } from "./types";
import type { ConquestTerritory, Team } from "@/lib/types/v2";
import type { ViewTransform } from "./useMapPanZoom";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BACKGROUND_COLOR,
  MAP_PATH_PREFIX,
  getRegionColor,
  getTerritoryColor,
  hexToRgb,
} from "./map-data";

const INTERIOR_TARGET = 0.45;
const INNER_BORDER_DEFAULT = 0.6;
const INNER_BORDER_HOVER = 0.8;

function classifyPixel(
  x: number,
  y: number,
  labelData: Uint8Array,
  w: number,
  h: number
): "sea" | "outer-border" | "inner-border" | "interior" {
  const label = labelData[y * w + x];
  if (label === 0) return "sea";

  const left = x > 0 ? labelData[y * w + (x - 1)] : -1;
  const right = x < w - 1 ? labelData[y * w + (x + 1)] : -1;
  const top = y > 0 ? labelData[(y - 1) * w + x] : -1;
  const bottom = y < h - 1 ? labelData[(y + 1) * w + x] : -1;

  const isOuterBorder = [left, right, top, bottom].some(
    (n) => n === 0 || n === -1
  );
  const isInnerBorder =
    (right > 0 && right !== label) || (bottom > 0 && bottom !== label);

  if (isOuterBorder) return "outer-border";
  if (isInnerBorder) return "inner-border";
  return "interior";
}

function resolveTerritoryColor(
  territoryIndex: number,
  territoryId: string,
  conquestTerritories: ConquestTerritory[],
  teams: Team[]
): [number, number, number] {
  const ct = conquestTerritories.find((t) => t.id === territoryId);
  if (ct?.controlling_team_id) {
    const team = teams.find((t) => t.id === ct.controlling_team_id);
    if (team?.color) return hexToRgb(team.color);
  }
  return getTerritoryColor(territoryIndex);
}

function buildOverlayBuffer(
  rd: RegionData,
  labelData: Uint8Array,
  conquestTerritories: ConquestTerritory[],
  teams: Team[]
): OverlayBuffer {
  const { name, imageWidth: w, imageHeight: h, offsetX, offsetY, territories } = rd;
  const hoverData = new ImageData(w, h);
  const borderData = new ImageData(w, h);
  const territoryPixels: Record<number, number[]> = {};
  const innerBorderPixels: Record<number, number[]> = {};
  const regionColor = getRegionColor(name);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const label = labelData[y * w + x]; // territory index (1-based), 0=sea
      if (label === 0) continue;

      const territory = territories.find((t) => t.index === label);
      if (!territory) continue;

      const terrColor = resolveTerritoryColor(
        label,
        territory.id,
        conquestTerritories,
        teams
      );
      const pi = y * w + x;
      const type = classifyPixel(x, y, labelData, w, h);

      if (type === "outer-border") {
        borderData.data[pi * 4 + 0] = regionColor[0];
        borderData.data[pi * 4 + 1] = regionColor[1];
        borderData.data[pi * 4 + 2] = regionColor[2];
        borderData.data[pi * 4 + 3] = 255;
      } else if (type === "inner-border" && (x + y) % 3 === 0) {
        borderData.data[pi * 4 + 0] = terrColor[0];
        borderData.data[pi * 4 + 1] = terrColor[1];
        borderData.data[pi * 4 + 2] = terrColor[2];
        borderData.data[pi * 4 + 3] = Math.round(INNER_BORDER_DEFAULT * 255);
        if (!innerBorderPixels[label]) innerBorderPixels[label] = [];
        innerBorderPixels[label].push(pi);
      } else if (type === "interior") {
        hoverData.data[pi * 4 + 0] = terrColor[0];
        hoverData.data[pi * 4 + 1] = terrColor[1];
        hoverData.data[pi * 4 + 2] = terrColor[2];
        hoverData.data[pi * 4 + 3] = 0;
        if (!territoryPixels[label]) territoryPixels[label] = [];
        territoryPixels[label].push(pi);
      }
    }
  }

  return {
    name,
    imageWidth: w,
    imageHeight: h,
    offsetX,
    offsetY,
    hoverData,
    borderData,
    territoryPixels,
    innerBorderPixels,
    labelData,
  };
}

function fullRedraw(
  ctx: CanvasRenderingContext2D,
  regionData: RegionData[],
  regionImages: Record<string, HTMLImageElement>,
  overlayBuffers: Record<string, OverlayBuffer>,
  tempCanvases: Record<string, { hover: HTMLCanvasElement; border: HTMLCanvasElement }>,
  transform: ViewTransform
) {
  // Fill background at identity (covers the whole canvas regardless of zoom)
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.setTransform(transform.scale, 0, 0, transform.scale, transform.x, transform.y);

  for (const rd of regionData) {
    const img = regionImages[rd.filename];
    if (img) ctx.drawImage(img, rd.offsetX, rd.offsetY);
  }

  for (const rd of regionData) {
    const buf = overlayBuffers[rd.name];
    const tc = tempCanvases[rd.name];
    if (!buf || !tc) continue;
    tc.hover.getContext("2d")!.putImageData(buf.hoverData, 0, 0);
    ctx.drawImage(tc.hover, buf.offsetX, buf.offsetY);
  }

  for (const rd of regionData) {
    const buf = overlayBuffers[rd.name];
    const tc = tempCanvases[rd.name];
    if (!buf || !tc) continue;
    tc.border.getContext("2d")!.putImageData(buf.borderData, 0, 0);
    ctx.drawImage(tc.border, buf.offsetX, buf.offsetY);
  }

  ctx.restore();
}

/** Extract just the red channel from a loaded label PNG into a flat Uint8Array. */
async function extractLabelData(
  src: string,
  w: number,
  h: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const raw = ctx.getImageData(0, 0, w, h).data;
      const label = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) label[i] = raw[i * 4]; // red channel
      resolve(label);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function useMapRenderer(
  regionData: RegionData[],
  conquestTerritories: ConquestTerritory[],
  teams: Team[],
  transformRef: React.MutableRefObject<ViewTransform>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const regionImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const labelDataRef = useRef<Record<string, Uint8Array>>({});
  const overlayBuffersRef = useRef<Record<string, OverlayBuffer>>({});
  const tempCanvasesRef = useRef<
    Record<string, { hover: HTMLCanvasElement; border: HTMLCanvasElement }>
  >({});
  const hoverStateRef = useRef<HoverState | null>(null);
  const hoverProgressRef = useRef<Record<string, number>>({});
  const rafRef = useRef<number>(0);

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [overlaysBuilt, setOverlaysBuilt] = useState(false);
  const transformDirtyRef = useRef(false);

  // Load region PNGs + label PNGs in parallel
  useEffect(() => {
    if (regionData.length === 0) return;
    setImagesLoaded(false);
    setOverlaysBuilt(false);

    const images: Record<string, HTMLImageElement> = {};
    const labelDatas: Record<string, Uint8Array> = {};
    let pending = regionData.length * 2; // one visual + one label per region

    const onDone = () => {
      pending--;
      if (pending === 0) {
        regionImagesRef.current = images;
        labelDataRef.current = labelDatas;
        setImagesLoaded(true);
      }
    };

    for (const rd of regionData) {
      const img = new Image();
      img.onload = () => { images[rd.filename] = img; onDone(); };
      img.onerror = onDone;
      img.src = `${MAP_PATH_PREFIX}${rd.filename}`;

      extractLabelData(
        `${MAP_PATH_PREFIX}${rd.label_filename}`,
        rd.imageWidth,
        rd.imageHeight
      )
        .then((data) => { labelDatas[rd.name] = data; onDone(); })
        .catch(onDone);
    }
  }, [regionData]);

  // Build overlay buffers — rebuilds when images load OR when ownership changes
  useEffect(() => {
    if (!imagesLoaded || regionData.length === 0) return;

    const buffers: Record<string, OverlayBuffer> = {};
    const tempCanvases: Record<
      string,
      { hover: HTMLCanvasElement; border: HTMLCanvasElement }
    > = {};

    for (const rd of regionData) {
      const labelData = labelDataRef.current[rd.name];
      if (!labelData) continue;

      buffers[rd.name] = buildOverlayBuffer(
        rd,
        labelData,
        conquestTerritories,
        teams
      );

      // Reuse existing temp canvases if they exist (avoid DOM churn on ownership updates)
      if (!tempCanvasesRef.current[rd.name]) {
        const hoverCanvas = document.createElement("canvas");
        hoverCanvas.width = rd.imageWidth;
        hoverCanvas.height = rd.imageHeight;
        const borderCanvas = document.createElement("canvas");
        borderCanvas.width = rd.imageWidth;
        borderCanvas.height = rd.imageHeight;
        tempCanvases[rd.name] = { hover: hoverCanvas, border: borderCanvas };
      } else {
        tempCanvases[rd.name] = tempCanvasesRef.current[rd.name];
      }
    }

    overlayBuffersRef.current = buffers;
    tempCanvasesRef.current = tempCanvases;

    // Reset hover progress so stale animations don't bleed across rebuilds
    hoverProgressRef.current = {};

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      fullRedraw(ctx, regionData, regionImagesRef.current, buffers, tempCanvases, transformRef.current);
    }

    setOverlaysBuilt(true);
  }, [imagesLoaded, regionData, conquestTerritories, teams]);

  // Animation loop
  useEffect(() => {
    if (!overlaysBuilt) return;

    function tick() {
      let dirty = false;
      const hoverState = hoverStateRef.current;
      const activeKey = hoverState
        ? `${hoverState.regionName}:${hoverState.label}`
        : null;

      if (activeKey && !(activeKey in hoverProgressRef.current)) {
        hoverProgressRef.current[activeKey] = 0;
      }

      for (const key of Object.keys(hoverProgressRef.current)) {
        const target = key === activeKey ? 1.0 : 0.0;
        const cur = hoverProgressRef.current[key];
        let next = cur + (target - cur) * 0.18;
        if (Math.abs(next - target) < 0.005) next = target;

        if (next !== cur) {
          dirty = true;
          hoverProgressRef.current[key] = next;

          const colonIdx = key.indexOf(":");
          const regionName = key.slice(0, colonIdx);
          const label = parseInt(key.slice(colonIdx + 1));
          const buf = overlayBuffersRef.current[regionName];
          if (!buf) continue;

          const interiorAlpha = Math.round(next * INTERIOR_TARGET * 255);
          for (const pi of buf.territoryPixels[label] ?? []) {
            buf.hoverData.data[pi * 4 + 3] = interiorAlpha;
          }

          const borderAlpha = Math.round(
            (INNER_BORDER_DEFAULT +
              next * (INNER_BORDER_HOVER - INNER_BORDER_DEFAULT)) *
              255
          );
          for (const pi of buf.innerBorderPixels[label] ?? []) {
            buf.borderData.data[pi * 4 + 3] = borderAlpha;
          }
        }

        if (next === 0 && key !== activeKey) {
          delete hoverProgressRef.current[key];
        }
      }

      if (dirty || transformDirtyRef.current) {
        transformDirtyRef.current = false;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          fullRedraw(
            ctx,
            regionData,
            regionImagesRef.current,
            overlayBuffersRef.current,
            tempCanvasesRef.current,
            transformRef.current
          );
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [overlaysBuilt, regionData]);

  const setHoverState = useCallback((state: HoverState | null) => {
    hoverStateRef.current = state;
  }, []);

  const markTransformDirty = useCallback(() => {
    transformDirtyRef.current = true;
  }, []);

  return { canvasRef, overlayBuffersRef, setHoverState, overlaysBuilt, markTransformDirty };
}
