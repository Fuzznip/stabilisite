"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Calendar, ImageOff, Images, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

/**
 * One screenshot plus whatever context the event wants shown beside it.
 *
 * The gallery deliberately does not fetch: conquest, botw and the collection
 * log race each resolve proofs differently, and making this own the fetching
 * would drag all three of those shapes in here. Callers hand it slides.
 */
export type ProofSlide = {
  src: string;
  /** Headline for this slide — usually the item. */
  title: string;
  /** Where it came from: a boss page, a territory. Shown muted. */
  subtitle?: string;
  playerName?: string;
  /** Rendered in its own colour when given, for team-scoped proofs. */
  teamName?: string;
  teamColor?: string | null;
  timestamp?: Date;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ProofGallery({
  open,
  onOpenChange,
  slides,
  loading = false,
  emptyMessage = "No screenshots yet.",
  fallbackTitle = "Screenshots",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides: ProofSlide[];
  loading?: boolean;
  emptyMessage?: string;
  /** Used for the dialog title before any slide has loaded. */
  fallbackTitle?: string;
}): React.ReactElement {
  // Two carousels: the full-size image, and the thumbnail strip beneath it.
  // The strip is what makes the rest of the set visible at a glance rather
  // than something you discover by paging blindly.
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    // No setSelectedIndex here: scrollTo emits Embla's `select`, which the
    // subscription below turns into state. Setting it here too would be a
    // second source of truth and a cascading render.
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Drag the strip along so the active thumbnail never scrolls out of sight.
  useEffect(() => {
    thumbApi?.scrollTo(selectedIndex);
  }, [thumbApi, selectedIndex]);

  const go = useCallback(
    (index: number) => carouselApi?.scrollTo(index),
    [carouselApi],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && selectedIndex > 0) {
        e.preventDefault();
        go(selectedIndex - 1);
      } else if (e.key === "ArrowRight" && selectedIndex < slides.length - 1) {
        e.preventDefault();
        go(selectedIndex + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, selectedIndex, slides.length, go]);

  const current = slides[selectedIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:h-[85vh] sm:max-w-[95vw] sm:min-w-[70vw]">
        <DialogHeader className="shrink-0 border-b border-foreground/10 px-5 pb-3 pt-5">
          <DialogTitle className="pr-8 text-2xl font-bold tracking-tight">
            {current?.title ?? fallbackTitle}
          </DialogTitle>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-muted-foreground">
            {current?.subtitle && (
              <span className="text-base">{current.subtitle}</span>
            )}
            {current?.playerName && (
              <span className="flex items-center gap-2 text-base">
                <User className="size-4" />
                {current.playerName}
              </span>
            )}
            {current?.teamName && (
              <span
                className="text-base font-semibold"
                style={{ color: current.teamColor ?? undefined }}
              >
                {current.teamName}
              </span>
            )}
            {current?.timestamp && (
              <span className="flex items-center gap-2 text-base">
                <Calendar className="size-4" />
                {formatDate(current.timestamp)}
              </span>
            )}
            {slides.length > 1 && (
              <span className="ml-auto flex items-center gap-2 text-base font-medium">
                <Images className="size-4" />
                {selectedIndex + 1} of {slides.length}
              </span>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Loading…
          </div>
        ) : slides.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ImageOff className="size-10" />
            <p className="text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <Carousel
              setApi={setCarouselApi}
              opts={{ loop: false }}
              // CarouselContent renders its own `overflow-hidden` wrapper that
              // takes no className, so a flex-1 passed to CarouselContent lands
              // on the inner track and the wrapper stays content-sized — which
              // is what left the image pinned to the top with dead space below.
              // Stretch that wrapper from here; the buttons are <button>, so
              // `&>div` only matches it.
              className="flex min-h-0 flex-1 flex-col [&>div]:min-h-0 [&>div]:flex-1"
            >
              <CarouselContent className="ml-0 h-full">
                {slides.map((slide, i) => (
                  <CarouselItem key={`${slide.src}-${i}`} className="h-full pl-0">
                    <div className="relative h-full w-full bg-black/20">
                      <Image
                        src={slide.src}
                        alt={slide.title}
                        fill
                        sizes="95vw"
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {slides.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>

            {slides.length > 1 && (
              <div className="shrink-0 border-t border-foreground/10 px-6 py-4">
                <Carousel
                  setApi={setThumbApi}
                  opts={{ align: "start", dragFree: true }}
                  className="w-full"
                >
                  <CarouselContent className="p-1">
                    {slides.map((slide, i) => (
                      <CarouselItem
                        key={`thumb-${slide.src}-${i}`}
                        className="basis-auto pl-3"
                      >
                        <button
                          type="button"
                          onClick={() => go(i)}
                          aria-label={`${slide.title} screenshot ${i + 1}`}
                          aria-current={selectedIndex === i}
                          className={cn(
                            "relative size-20 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200",
                            selectedIndex === i
                              ? "scale-105 border-foreground ring-2 ring-foreground/30"
                              : "border-foreground/20 opacity-50 hover:border-foreground/40 hover:opacity-100",
                          )}
                          style={
                            selectedIndex === i && slide.teamColor
                              ? { borderColor: slide.teamColor }
                              : undefined
                          }
                        >
                          <Image
                            src={slide.src}
                            alt=""
                            fill
                            sizes="80px"
                            unoptimized
                            className="object-cover"
                          />
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {slides.length > 8 && (
                    <>
                      <CarouselPrevious className="left-0 size-10 -translate-x-1/2" />
                      <CarouselNext className="right-0 size-10 translate-x-1/2" />
                    </>
                  )}
                </Carousel>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
