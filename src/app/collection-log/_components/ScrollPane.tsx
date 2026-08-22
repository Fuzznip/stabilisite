"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Game pixels the arrow buttons scroll per click, and per tick when held. */
const ARROW_STEP = 15;
const ARROW_REPEAT_MS = 50;
/** The thumb's caps are 5px each, so it can never be shorter than both. */
const MIN_THUMB = 15;

/**
 * Class lists must stay literal: Tailwind scans source text, so an interpolated
 * or runtime-built class name produces no CSS at all.
 *
 * Sizes are game pixels times --cl-scale, which the log's root element defines.
 */
const ARROW = cn(
  "shrink-0 w-[calc(16*var(--cl-px))] h-[calc(16*var(--cl-px))] cursor-pointer",
  "bg-no-repeat [background-size:100%_100%]",
  "focus-visible:[outline:var(--cl-px)_solid_var(--cl-white)]",
  "focus-visible:[outline-offset:calc(-1*var(--cl-px))]"
);

/** Three-piece thumb: 5px caps top and bottom, middle tiles between them. */
const THUMB = cn(
  "absolute left-0 w-full bg-center bg-repeat-y",
  "bg-[url(/collection-log/ui/scroll-thumb-mid.png)]",
  "[background-size:100%_calc(5*var(--cl-px))]",
  'before:content-[""] before:absolute before:left-0 before:top-0 before:w-full',
  "before:h-[calc(5*var(--cl-px))] before:bg-no-repeat",
  "before:bg-[url(/collection-log/ui/scroll-thumb-top.png)]",
  "before:[background-size:100%_100%]",
  'after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-full',
  "after:h-[calc(5*var(--cl-px))] after:bg-no-repeat",
  "after:bg-[url(/collection-log/ui/scroll-thumb-bottom.png)]",
  "after:[background-size:100%_100%]"
);

type Metrics = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  trackHeight: number;
  /** --cl-scale, so scroll steps stay a fixed number of *game* pixels. */
  scale: number;
};

const EMPTY: Metrics = {
  scrollTop: 0,
  scrollHeight: 0,
  clientHeight: 0,
  trackHeight: 0,
  scale: 1,
};

/**
 * Scrollable area with the client's own scrollbar drawn from cache sprites: two
 * arrow buttons and a three-piece thumb. The viewport hides its native
 * scrollbar, so this replaces it visually while the viewport keeps handling
 * wheel and keyboard scrolling.
 */
export function ScrollPane({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = useState<Metrics>(EMPTY);
  const [dragging, setDragging] = useState(false);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const scale = Number.parseFloat(
      getComputedStyle(viewport).getPropertyValue("--cl-scale")
    );
    setMetrics({
      scrollTop: viewport.scrollTop,
      scrollHeight: viewport.scrollHeight,
      clientHeight: viewport.clientHeight,
      trackHeight: track?.clientHeight ?? 0,
      scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
    });
  }, [track]);

  // Content height, viewport height and track height all change independently
  // (tab switches, window resizes, the scrollbar appearing), so observe them
  // all rather than measuring only on scroll.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    for (const child of Array.from(viewport.children)) observer.observe(child);
    if (track) observer.observe(track);
    return () => observer.disconnect();
  }, [measure, track, children]);

  const scrollable = metrics.scrollHeight - metrics.clientHeight;
  const hasOverflow = scrollable > 0;

  const scrollBy = useCallback((delta: number) => {
    viewportRef.current?.scrollBy({ top: delta });
  }, []);

  const thumbHeight = hasOverflow
    ? Math.max(
        MIN_THUMB * metrics.scale,
        (metrics.clientHeight / metrics.scrollHeight) * metrics.trackHeight
      )
    : 0;
  const thumbRange = Math.max(0, metrics.trackHeight - thumbHeight);
  const thumbTop = hasOverflow
    ? (metrics.scrollTop / scrollable) * thumbRange
    : 0;

  // Holding an arrow scrolls continuously, as it does in game.
  const holdArrow = (event: React.PointerEvent, direction: 1 | -1) => {
    event.preventDefault();
    const step = direction * ARROW_STEP * metrics.scale;
    scrollBy(step);
    const timer = setInterval(() => scrollBy(step), ARROW_REPEAT_MS);
    const stop = () => {
      clearInterval(timer);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  };

  const startDrag = (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const viewport = viewportRef.current;
    if (!track || !viewport || thumbRange <= 0) return;
    const grabOffset =
      event.clientY - track.getBoundingClientRect().top - thumbTop;
    setDragging(true);

    const move = (moveEvent: PointerEvent) => {
      const offset =
        moveEvent.clientY - track.getBoundingClientRect().top - grabOffset;
      const clamped = Math.min(Math.max(offset, 0), thumbRange);
      viewport.scrollTop = (clamped / thumbRange) * scrollable;
    };
    const stop = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  };

  // Clicking the track pages towards the click, like the client's scrollbar.
  const pageTowards = (event: React.PointerEvent) => {
    if (!track) return;
    const y = event.clientY - track.getBoundingClientRect().top;
    scrollBy(y < thumbTop ? -metrics.clientHeight : metrics.clientHeight);
  };

  return (
    <div className={cn("flex flex-1 min-h-0 min-w-0", className)}>
      <div
        ref={viewportRef}
        onScroll={measure}
        data-scroll-viewport=""
        className={cn(
          "flex-1 min-w-0 overflow-y-auto overflow-x-hidden",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {children}
      </div>
      {hasOverflow && (
        <div className="relative shrink-0 flex flex-col w-[calc(16*var(--cl-px))] touch-none">
          <button
            type="button"
            aria-label="Scroll up"
            onPointerDown={(event) => holdArrow(event, -1)}
            className={cn(ARROW, "bg-[url(/collection-log/ui/scroll-up.png)]")}
          />
          <div
            ref={setTrack}
            onPointerDown={pageTowards}
            className={cn(
              "relative flex-1 min-h-0 cursor-pointer bg-center bg-repeat-y",
              "bg-[url(/collection-log/ui/scroll-track.png)]",
              "[background-size:100%_calc(5*var(--cl-px))]"
            )}
          >
            <div
              onPointerDown={startDrag}
              style={{ top: thumbTop, height: thumbHeight }}
              className={cn(THUMB, dragging ? "cursor-grabbing" : "cursor-grab")}
            />
          </div>
          <button
            type="button"
            aria-label="Scroll down"
            onPointerDown={(event) => holdArrow(event, 1)}
            className={cn(ARROW, "bg-[url(/collection-log/ui/scroll-down.png)]")}
          />
        </div>
      )}
    </div>
  );
}

/** Scrolls a pane back to the top when its key changes (e.g. a new page). */
export function useResetScroll(
  ref: React.RefObject<HTMLElement | null>,
  key: unknown
) {
  useEffect(() => {
    const viewport = ref.current?.querySelector("[data-scroll-viewport]");
    if (viewport instanceof HTMLElement) viewport.scrollTop = 0;
  }, [ref, key]);
}
