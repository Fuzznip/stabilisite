"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, Marker, useMap, useMapEvents } from "react-leaflet";
import L, { CRS } from "leaflet";
import type { RegionData, OverlayBuffer, HoverState, HoverInfo } from "./types";
import type {
  ConquestRegion,
  ConquestTerritory,
  Event,
  Team,
} from "@/lib/types/v2";
import { TerritoryHoverPanel } from "./TerritoryHoverPanel";
import { MapLegend } from "./MapLegend";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BORDER_COLOR,
  MAP_PATH_PREFIX,
  getGroupDisplayName,
  getGroupKey,
  getRegionColor,
  hexToRgb,
} from "./map-data";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERIOR_TARGET = 0.45;
const INNER_BORDER_DEFAULT = 0.6;
const INNER_BORDER_HOVER = 0.8;
const HOVER_FILL_COLOR: [number, number, number] = [140, 108, 108];

const MAP_BOUNDS = L.latLngBounds([
  [-CANVAS_HEIGHT, 0],
  [0, CANVAS_WIDTH],
]);

// ─── Pure rendering functions ─────────────────────────────────────────────────

async function extractLabelData(
  src: string,
  w: number,
  h: number,
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
      for (let i = 0; i < w * h; i++) label[i] = raw[i * 4];
      resolve(label);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function classifyPixel(
  x: number,
  y: number,
  labelData: Uint8Array,
  w: number,
  h: number,
): "sea" | "outer-border" | "inner-border" | "interior" {
  const label = labelData[y * w + x];
  if (label === 0) return "sea";
  const left = x > 0 ? labelData[y * w + (x - 1)] : -1;
  const right = x < w - 1 ? labelData[y * w + (x + 1)] : -1;
  const top = y > 0 ? labelData[(y - 1) * w + x] : -1;
  const bottom = y < h - 1 ? labelData[(y + 1) * w + x] : -1;
  if ([left, right, top, bottom].some((n) => n === 0 || n === -1))
    return "outer-border";
  if ((right > 0 && right !== label) || (bottom > 0 && bottom !== label))
    return "inner-border";
  return "interior";
}

function buildOverlayBuffer(
  rd: RegionData,
  labelData: Uint8Array,
  conquestTerritories: ConquestTerritory[],
  teams: Team[],
): OverlayBuffer {
  const {
    name,
    imageWidth: w,
    imageHeight: h,
    offsetX,
    offsetY,
    territories,
  } = rd;
  const regionColor = getRegionColor(name);
  const hoverData = new ImageData(w, h);
  const borderData = new ImageData(w, h);
  const territoryPixels: Record<number, number[]> = {};
  const innerBorderPixels: Record<number, number[]> = {};
  const ownedLabels = new Set<number>();
  const ownedColors = new Map<number, [number, number, number]>();

  // Pre-compute ownership per label to avoid per-pixel lookups
  for (const t of territories) {
    const ct = conquestTerritories.find((c) => c.id === t.id);
    if (ct?.controlling_team_id) {
      const team = teams.find((tm) => tm.id === ct.controlling_team_id);
      if (team?.color) {
        ownedLabels.add(t.index);
        ownedColors.set(t.index, hexToRgb(team.color));
      }
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const label = labelData[y * w + x];
      if (label === 0) continue;
      const territory = territories.find((t) => t.index === label);
      if (!territory) continue;

      const pi = y * w + x;
      const type = classifyPixel(x, y, labelData, w, h);

      if (type === "outer-border") {
        borderData.data[pi * 4] = regionColor[0];
        borderData.data[pi * 4 + 1] = regionColor[1];
        borderData.data[pi * 4 + 2] = regionColor[2];
        borderData.data[pi * 4 + 3] = 255;
      } else if (type === "inner-border" && (x + y) % 3 === 0) {
        borderData.data[pi * 4] = BORDER_COLOR[0];
        borderData.data[pi * 4 + 1] = BORDER_COLOR[1];
        borderData.data[pi * 4 + 2] = BORDER_COLOR[2];
        borderData.data[pi * 4 + 3] = Math.round(INNER_BORDER_DEFAULT * 255);
        if (!innerBorderPixels[label]) innerBorderPixels[label] = [];
        innerBorderPixels[label].push(pi);
      } else if (type === "interior") {
        const teamColor = ownedColors.get(label);
        if (teamColor) {
          hoverData.data[pi * 4] = teamColor[0];
          hoverData.data[pi * 4 + 1] = teamColor[1];
          hoverData.data[pi * 4 + 2] = teamColor[2];
          hoverData.data[pi * 4 + 3] = Math.round(INTERIOR_TARGET * 255);
        } else {
          hoverData.data[pi * 4] = HOVER_FILL_COLOR[0];
          hoverData.data[pi * 4 + 1] = HOVER_FILL_COLOR[1];
          hoverData.data[pi * 4 + 2] = HOVER_FILL_COLOR[2];
          hoverData.data[pi * 4 + 3] = 0;
        }
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
    ownedLabels,
    ownedColors,
    labelData,
  };
}

function fullRedraw(
  ctx: CanvasRenderingContext2D,
  regionData: RegionData[],
  regionImages: Record<string, HTMLImageElement>,
  overlayBuffers: Record<string, OverlayBuffer>,
  tempCanvases: Record<
    string,
    { hover: HTMLCanvasElement; border: HTMLCanvasElement }
  >,
  activeGroupKey?: string | null,
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
    if (activeGroupKey && getGroupKey(rd.name) !== activeGroupKey) continue;
    const buf = overlayBuffers[rd.name];
    const tc = tempCanvases[rd.name];
    if (!buf || !tc) continue;
    tc.border.getContext("2d")!.putImageData(buf.borderData, 0, 0);
    ctx.drawImage(tc.border, buf.offsetX, buf.offsetY);
  }
}

// ─── Marker icons ─────────────────────────────────────────────────────────────

const UNCONTROLLED_ICON = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" opacity="0.8" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.7))"><circle cx="12" cy="12" r="10" style="fill:hsl(var(--background));stroke:hsl(var(--foreground))" stroke-width="1.5"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" fill="none" style="stroke:hsl(var(--foreground))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 17h.01" fill="none" style="stroke:hsl(var(--foreground))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function makeTeamIcon(team: Team): L.DivIcon {
  const inner = team.image_url
    ? `<img src="${team.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
    : `<div style="width:100%;height:100%;border-radius:50%;background:${team.color ?? "#888"}"></div>`;
  return L.divIcon({
    html: `<div style="width:32px;height:32px;border-radius:50%;overflow:hidden;opacity:0.9;box-sizing:border-box;border:2px solid ${team.color ?? "#888"};filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))">${inner}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// ─── Canvas layer ─────────────────────────────────────────────────────────────

// key: `${regionName}:${territoryId}`, value: canvas-space coords
type CentroidMap = Record<string, { x: number; y: number }>;

interface CanvasLayerProps {
  regionData: RegionData[];
  conquestTerritories: ConquestTerritory[];
  teams: Team[];
  highlightTeamId?: string | null;
  activeGroupKey?: string | null;
  onHoverChange: (
    info: HoverInfo | null,
    mousePos: { x: number; y: number },
  ) => void;
  onCentroidsReady: (centroids: CentroidMap) => void;
  onGroupKeyChange?: (groupKey: string | null) => void;
}

function TerritoryCanvasLayer({
  regionData,
  conquestTerritories,
  teams,
  highlightTeamId,
  activeGroupKey,
  onHoverChange,
  onCentroidsReady,
  onGroupKeyChange,
}: CanvasLayerProps) {
  const map = useMap();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const regionImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const labelDataRef = useRef<Record<string, Uint8Array>>({});
  const overlayBuffersRef = useRef<Record<string, OverlayBuffer>>({});
  const tempCanvasesRef = useRef<
    Record<string, { hover: HTMLCanvasElement; border: HTMLCanvasElement }>
  >({});
  const hoverStateRef = useRef<HoverState | null>(null);
  const hoverProgressRef = useRef<Record<string, number>>({});
  const highlightedKeysRef = useRef<Set<string>>(new Set());
  const highlightTeamColorRef = useRef<[number, number, number] | null>(null);
  const hoverColorsDirtyRef = useRef(false);
  const activeGroupKeyRef = useRef<string | null | undefined>(activeGroupKey);
  const rafRef = useRef<number>(0);

  const [loadedFor, setLoadedFor] = useState<RegionData[] | null>(null);
  const imagesLoaded = loadedFor === regionData;

  // Step 1: Set up canvas element in a dedicated Leaflet pane
  useEffect(() => {
    // Use the built-in overlayPane — it already has leaflet-zoom-animated so it
    // participates in the same CSS zoom transition as the markerPane, keeping
    // the canvas and markers in sync during zoom.
    const pane = map.getPane("overlayPane")!;

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.position = "absolute";
    canvas.style.imageRendering = "pixelated";
    canvas.style.pointerEvents = "none";
    // leaflet-zoom-animated enables the CSS transition on this element's
    // transform property, matching how L.Canvas (the vector renderer) works.
    canvas.classList.add("leaflet-zoom-animated");
    pane.appendChild(canvas);
    canvasRef.current = canvas;

    function updatePosition() {
      // Skip during animated zoom — zoomanim already set the animated transform.
      // Calling setPosition here would clobber the scale and snap the canvas.
      if ((map as unknown as { _animatingZoom: boolean })._animatingZoom)
        return;
      const nw = map.latLngToLayerPoint(L.latLng(0, 0));
      const se = map.latLngToLayerPoint(L.latLng(-CANVAS_HEIGHT, CANVAS_WIDTH));
      L.DomUtil.setPosition(canvas, nw);
      canvas.style.width = `${se.x - nw.x}px`;
      canvas.style.height = `${se.y - nw.y}px`;
    }

    function onZoomAnim(e: L.ZoomAnimEvent) {
      // Mirrors L.Canvas._animateZoom: apply translate + scale in a single
      // CSS transform so the CSS transition (from leaflet-zoom-animated)
      // animates both simultaneously, staying in sync with markers.
      const m = map as unknown as {
        _latLngToNewLayerPoint: (
          ll: L.LatLng,
          zoom: number,
          center: L.LatLng,
        ) => L.Point;
      };
      const nw = m._latLngToNewLayerPoint(L.latLng(0, 0), e.zoom, e.center);
      const scale = map.getZoomScale(e.zoom);
      // L.DomUtil.setTransform exists but may not be in @types/leaflet — cast.
      (
        L.DomUtil as unknown as {
          setTransform: (
            el: HTMLElement,
            offset: L.Point,
            scale: number,
          ) => void;
        }
      ).setTransform(canvas, nw, scale);
      // CSS width/height are left unchanged; the scale transform handles the
      // visual sizing during the transition. viewreset will sync them after.
    }

    // Custom smooth scroll zoom — bypasses Leaflet's Math.round/_getDelta which
    // drops small trackpad deltas. Zoom is applied directly, proportional to
    // raw wheel pixels, centered on the cursor position.
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = -e.deltaY / 150; // tune: higher divisor = slower zoom
      const containerPoint = map.mouseEventToContainerPoint(e);
      map.setZoomAround(containerPoint, map.getZoom() + delta, {
        animate: false,
      });
    }
    const container = map.getContainer();
    container.addEventListener("wheel", onWheel, { passive: false });

    map.on("move viewreset zoomend", updatePosition);
    map.on("zoomanim", onZoomAnim as L.LeafletEventHandlerFn);
    updatePosition();

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener("wheel", onWheel);
      map.off("move viewreset zoomend", updatePosition);
      map.off("zoomanim", onZoomAnim as L.LeafletEventHandlerFn);
      canvas.remove();
      canvasRef.current = null;
    };
  }, [map]);

  // Step 2: Load images and label PNGs
  useEffect(() => {
    if (regionData.length === 0) return;
    const images: Record<string, HTMLImageElement> = {};
    const labelDatas: Record<string, Uint8Array> = {};
    let pending = regionData.length * 2;

    function onDone() {
      pending--;
      if (pending === 0) {
        regionImagesRef.current = images;
        labelDataRef.current = labelDatas;
        setLoadedFor(regionData);
      }
    }

    for (const rd of regionData) {
      const img = new Image();
      img.onload = () => {
        images[rd.filename] = img;
        onDone();
      };
      img.onerror = onDone;
      img.src = `${MAP_PATH_PREFIX}${rd.filename}`;

      extractLabelData(
        `${MAP_PATH_PREFIX}${rd.label_filename}`,
        rd.imageWidth,
        rd.imageHeight,
      )
        .then((data) => {
          labelDatas[rd.name] = data;
          onDone();
        })
        .catch(onDone);
    }
  }, [regionData]);

  // Step 3: Build overlay buffers (rebuilds when ownership changes)
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

      buffers[rd.name] = buildOverlayBuffer(rd, labelData, conquestTerritories, teams);

      if (!tempCanvasesRef.current[rd.name]) {
        const hc = document.createElement("canvas");
        hc.width = rd.imageWidth;
        hc.height = rd.imageHeight;
        const bc = document.createElement("canvas");
        bc.width = rd.imageWidth;
        bc.height = rd.imageHeight;
        tempCanvases[rd.name] = { hover: hc, border: bc };
      } else {
        tempCanvases[rd.name] = tempCanvasesRef.current[rd.name];
      }
    }

    overlayBuffersRef.current = buffers;
    tempCanvasesRef.current = tempCanvases;
    hoverProgressRef.current = {};

    // Compute true centroids from interior pixels so markers land on actual land
    const centroids: CentroidMap = {};
    for (const rd of regionData) {
      const buf = buffers[rd.name];
      if (!buf) continue;
      for (const t of rd.territories) {
        const pixels = buf.territoryPixels[t.index];
        if (!pixels || pixels.length === 0) continue;
        let sumX = 0,
          sumY = 0;
        for (const pi of pixels) {
          sumX += pi % rd.imageWidth;
          sumY += Math.floor(pi / rd.imageWidth);
        }
        centroids[`${rd.name}:${t.id}`] = {
          x: rd.offsetX + sumX / pixels.length,
          y: rd.offsetY + sumY / pixels.length,
        };
      }
    }
    onCentroidsReady(centroids);

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx)
      fullRedraw(
        ctx,
        regionData,
        regionImagesRef.current,
        buffers,
        tempCanvases,
        activeGroupKeyRef.current,
      );
  }, [imagesLoaded, regionData, conquestTerritories, teams, onCentroidsReady]);

  // Step 3b: Sync activeGroupKey ref and redraw immediately when it changes
  useEffect(() => {
    activeGroupKeyRef.current = activeGroupKey;
    hoverColorsDirtyRef.current = true;
    // Seed all owned territories so out-of-region ones animate out
    for (const rd of regionData) {
      const buf = overlayBuffersRef.current[rd.name];
      if (!buf) continue;
      for (const label of buf.ownedLabels) {
        const key = `${rd.name}:${label}`;
        if (!(key in hoverProgressRef.current)) {
          hoverProgressRef.current[key] = 0;
        }
      }
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx)
      fullRedraw(
        ctx,
        regionData,
        regionImagesRef.current,
        overlayBuffersRef.current,
        tempCanvasesRef.current,
        activeGroupKey,
      );
  }, [activeGroupKey, regionData]);

  // Step 3c: Sync highlighted territory keys when highlightTeamId changes
  useEffect(() => {
    const keys = new Set<string>();
    if (highlightTeamId) {
      for (const rd of regionData) {
        for (const t of rd.territories) {
          const ct = conquestTerritories.find((c) => c.id === t.id);
          if (ct?.controlling_team_id === highlightTeamId) {
            keys.add(`${rd.name}:${t.index}`);
          }
        }
      }
    }
    highlightedKeysRef.current = keys;
    const selectedTeam = highlightTeamId ? teams.find((t) => t.id === highlightTeamId) : null;
    highlightTeamColorRef.current = selectedTeam?.color ? hexToRgb(selectedTeam.color) : null;
    hoverColorsDirtyRef.current = true;
    // Seed ALL owned territories so non-selected ones animate out and back in
    for (const rd of regionData) {
      const buf = overlayBuffersRef.current[rd.name];
      if (!buf) continue;
      for (const label of buf.ownedLabels) {
        const key = `${rd.name}:${label}`;
        if (!(key in hoverProgressRef.current)) {
          hoverProgressRef.current[key] = 0;
        }
      }
    }
  }, [highlightTeamId, conquestTerritories, regionData, teams]);

  // Step 4: RAF hover animation loop
  useEffect(() => {
    function tick() {
      let dirty = false;
      const activeKey = hoverStateRef.current
        ? `${hoverStateRef.current.regionName}:${hoverStateRef.current.label}`
        : null;

      if (activeKey && !(activeKey in hoverProgressRef.current)) {
        hoverProgressRef.current[activeKey] = 0;
      }

      const colorsDirty = hoverColorsDirtyRef.current;
      if (colorsDirty) {
        hoverColorsDirtyRef.current = false;
        dirty = true;
      }

      for (const key of Object.keys(hoverProgressRef.current)) {
        const isHighlighted = highlightedKeysRef.current.has(key);
        const target = key === activeKey || isHighlighted ? 1.0 : 0.0;
        const cur = hoverProgressRef.current[key];
        let next = cur + (target - cur) * 0.18;
        if (Math.abs(next - target) < 0.005) next = target;

        const sep = key.indexOf(":");
        const regionName = key.slice(0, sep);
        const label = parseInt(key.slice(sep + 1));
        const buf = overlayBuffersRef.current[regionName];
        if (!buf) continue;

        // Update fill color when colors are dirty or animation is running
        if (colorsDirty || next !== cur) {
          const isOwned = buf.ownedLabels.has(label);
          const hasSelection = highlightedKeysRef.current.size > 0;
          const inActiveGroup = !activeGroupKeyRef.current || getGroupKey(regionName) === activeGroupKeyRef.current;
          // Show at base: owned, in active group (or no group filter), and not filtered out by team selection
          const showsAtBase = isOwned && inActiveGroup && (!hasSelection || isHighlighted);
          const color =
            isHighlighted && highlightTeamColorRef.current
              ? highlightTeamColorRef.current
              : isOwned
              ? (buf.ownedColors.get(label) ?? HOVER_FILL_COLOR)
              : HOVER_FILL_COLOR;
          const baseAlpha = showsAtBase ? INTERIOR_TARGET : 0;
          const interiorAlpha = Math.round((baseAlpha + next * (INTERIOR_TARGET - baseAlpha)) * 255);
          for (const pi of buf.territoryPixels[label] ?? []) {
            buf.hoverData.data[pi * 4] = color[0];
            buf.hoverData.data[pi * 4 + 1] = color[1];
            buf.hoverData.data[pi * 4 + 2] = color[2];
            buf.hoverData.data[pi * 4 + 3] = interiorAlpha;
          }
        }

        if (next !== cur) {
          dirty = true;
          hoverProgressRef.current[key] = next;
          const borderAlpha = Math.round(
            (INNER_BORDER_DEFAULT +
              next * (INNER_BORDER_HOVER - INNER_BORDER_DEFAULT)) *
              255,
          );
          for (const pi of buf.innerBorderPixels[label] ?? []) {
            buf.borderData.data[pi * 4 + 3] = borderAlpha;
          }
        }

        if (next === 0 && key !== activeKey && !isHighlighted)
          delete hoverProgressRef.current[key];
      }

      if (dirty) {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx)
          fullRedraw(
            ctx,
            regionData,
            regionImagesRef.current,
            overlayBuffersRef.current,
            tempCanvasesRef.current,
            activeGroupKeyRef.current,
          );
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [regionData]);

  // Step 5: Hover detection via Leaflet events (world coords — no transform math needed)
  useMapEvents({
    click(e) {
      const x = Math.floor(e.latlng.lng);
      const y = Math.floor(-e.latlng.lat);
      for (const rd of regionData) {
        const lx = x - rd.offsetX;
        const ly = y - rd.offsetY;
        if (lx < 0 || ly < 0 || lx >= rd.imageWidth || ly >= rd.imageHeight) continue;
        const buf = overlayBuffersRef.current[rd.name];
        if (!buf) continue;
        const label = buf.labelData[ly * rd.imageWidth + lx];
        if (label > 0) {
          const groupKey = getGroupKey(rd.name);
          onGroupKeyChange?.(groupKey === activeGroupKey ? null : groupKey);
          return;
        }
      }
    },
    mousemove(e) {
      const x = Math.floor(e.latlng.lng);
      const y = Math.floor(-e.latlng.lat);

      for (const rd of regionData) {
        const lx = x - rd.offsetX;
        const ly = y - rd.offsetY;
        if (lx < 0 || ly < 0 || lx >= rd.imageWidth || ly >= rd.imageHeight)
          continue;

        const buf = overlayBuffersRef.current[rd.name];
        if (!buf) continue;

        const label = buf.labelData[ly * rd.imageWidth + lx];
        if (label > 0) {
          const territory = rd.territories.find((t) => t.index === label);
          if (territory) {
            hoverStateRef.current = { regionName: rd.name, label };
            onHoverChange(
              {
                regionDisplayName: getGroupDisplayName(rd.name),
                territoryName: territory.name,
                territoryId: territory.id,
              },
              { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
            );
            return;
          }
        }
      }

      hoverStateRef.current = null;
      onHoverChange(null, { x: 0, y: 0 });
    },
    mouseout() {
      hoverStateRef.current = null;
      onHoverChange(null, { x: 0, y: 0 });
    },
  });

  return null;
}

// ─── Markers layer ────────────────────────────────────────────────────────────

function TerritoryMarkersLayer({
  regionData,
  centroids,
  conquestTerritories,
  teams,
  activeGroupKey,
  highlightTeamId,
}: {
  regionData: RegionData[];
  centroids: CentroidMap;
  conquestTerritories: ConquestTerritory[];
  teams: Team[];
  activeGroupKey?: string | null;
  highlightTeamId?: string | null;
}) {
  return (
    <>
      {regionData.flatMap((rd) => {
        if (activeGroupKey && getGroupKey(rd.name) !== activeGroupKey) return [];
        return rd.territories.flatMap((t) => {
          const ct = conquestTerritories.find((ct) => ct.id === t.id);
          if (highlightTeamId && ct?.controlling_team_id !== highlightTeamId) return [];
          const c = centroids[`${rd.name}:${t.id}`];
          const pos = c
            ? L.latLng(-c.y, c.x)
            : L.latLng(-(rd.offsetY + t.cy), rd.offsetX + t.cx);
          const team = ct?.controlling_team_id
            ? teams.find((tm) => tm.id === ct.controlling_team_id)
            : null;
          const icon = team ? makeTeamIcon(team) : UNCONTROLLED_ICON;
          return (
            <Marker
              key={`${rd.name}:${t.id}`}
              position={pos}
              icon={icon}
              interactive={false}
            />
          );
        });
      })}
    </>
  );
}

// ─── Fly-to-region component ──────────────────────────────────────────────────

function FlyToRegion({
  regionData,
  activeGroupKey,
}: {
  regionData: RegionData[];
  activeGroupKey?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!activeGroupKey) {
      map.stop();
      map.flyToBounds(MAP_BOUNDS, { padding: [5, 5], duration: 0.4 });
      return;
    }

    const matching = regionData.filter(
      (rd) => getGroupKey(rd.name) === activeGroupKey,
    );
    if (matching.length === 0) return;

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const rd of matching) {
      minX = Math.min(minX, rd.offsetX);
      maxX = Math.max(maxX, rd.offsetX + rd.imageWidth);
      minY = Math.min(minY, rd.offsetY);
      maxY = Math.max(maxY, rd.offsetY + rd.imageHeight);
    }

    const bounds = L.latLngBounds([-maxY, minX], [-minY, maxX]);
    map.stop();
    map.flyToBounds(bounds, { padding: [30, 30], duration: 0.6 });
  }, [activeGroupKey, regionData, map]);

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TerritoryMapProps {
  event: Event;
  regionData: RegionData[];
  conquestTerritories: ConquestTerritory[];
  teams: Team[];
  regions: ConquestRegion[];
  hideTitle?: boolean;
  hideLegend?: boolean;
  highlightTeamId?: string | null;
  activeGroupKey?: string | null;
  onGroupKeyChange?: (groupKey: string | null) => void;
  fillHeight?: boolean;
}

export function TerritoryMap({
  event,
  regionData,
  conquestTerritories,
  teams,
  regions,
  hideTitle = false,
  hideLegend = false,
  highlightTeamId,
  activeGroupKey,
  onGroupKeyChange,
  fillHeight = false,
}: TerritoryMapProps) {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [centroids, setCentroids] = useState<CentroidMap>({});

  const handleHoverChange = useCallback(
    (info: HoverInfo | null, pos: { x: number; y: number }) => {
      setHoverInfo(info);
      if (info) setMousePos(pos);
    },
    [],
  );

  return (
    <div className={`flex flex-col items-center w-full${fillHeight ? " h-full" : ""}`}>
      {!hideTitle && (
        <h1 className="text-center text-3xl font-bold tracking-[0.12em] uppercase text-foreground [font-family:var(--font-cinzel)]">
          {event?.name}
        </h1>
      )}
      <div
        className={`relative w-full rounded-[18px] overflow-hidden${fillHeight ? " h-full" : ""}`}
        style={{
          aspectRatio: fillHeight ? undefined : `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
          backgroundImage:
            "linear-gradient(rgba(107,100,102,0.6), rgba(107,100,102,0.6)), url(/map_background.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#6b6466",
          border: "3px solid rgba(230,57,70,0.5)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.4) inset, 0 30px 80px -30px rgba(0,0,0,0.8), 0 0 60px -10px rgba(74,142,240,0.08)",
        }}
      >
        <div className="absolute inset-0">
        <MapContainer
          crs={CRS.Simple}
          bounds={MAP_BOUNDS}
          maxBounds={MAP_BOUNDS}
          maxBoundsViscosity={0.8}
          className="w-full h-full"
          scrollWheelZoom={false}
          doubleClickZoom
          zoomSnap={0}
          attributionControl={false}
          zoomControl={false}
          style={{ background: "transparent" }}
        >
          <FlyToRegion regionData={regionData} activeGroupKey={activeGroupKey} />
          <TerritoryCanvasLayer
            regionData={regionData}
            conquestTerritories={conquestTerritories}
            teams={teams}
            highlightTeamId={highlightTeamId}
            activeGroupKey={activeGroupKey}
            onHoverChange={handleHoverChange}
            onCentroidsReady={setCentroids}
            onGroupKeyChange={onGroupKeyChange}
          />
          <TerritoryMarkersLayer
            regionData={regionData}
            centroids={centroids}
            conquestTerritories={conquestTerritories}
            teams={teams}
            activeGroupKey={activeGroupKey}
            highlightTeamId={highlightTeamId}
          />
        </MapContainer>
        </div>
      </div>
      {!hideLegend && (
        <MapLegend regionData={regionData} regions={regions} teams={teams} />
      )}
      {typeof document !== "undefined" &&
        createPortal(
          <TerritoryHoverPanel
            hover={hoverInfo}
            mousePos={mousePos}
            conquestTerritories={conquestTerritories}
            teams={teams}
          />,
          document.body,
        )}
    </div>
  );
}
