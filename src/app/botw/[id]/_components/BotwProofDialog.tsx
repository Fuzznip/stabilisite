"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useQueries } from "@tanstack/react-query";
import { Calendar, ImageOff, Images } from "lucide-react";
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
import type { BotwLeaderboardDrop, BotwProof } from "@/lib/types/v2";

async function fetchProofs(statusId: string): Promise<BotwProof[]> {
  const res = await fetch(`/api/botw/statuses/${statusId}/proofs`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

type Slide = {
  src: string;
  itemName: string;
  points: number;
  triggerId: string;
  timestamp: Date;
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Every screenshot one player has banked in the event, opened at whichever drop
 * was clicked. Proofs hang off a challenge status, so this is one request per
 * distinct drop — bounded by drops the player actually has, not by proof count,
 * and only issued once the dialog is open.
 */
export function BotwProofDialog({
  open,
  onOpenChange,
  playerName,
  drops,
  initialTriggerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  drops: BotwLeaderboardDrop[];
  initialTriggerId: string | null;
}) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useQueries({
    queries: drops.map((drop) => ({
      queryKey: ["botw-proofs", drop.status_id],
      queryFn: () => fetchProofs(drop.status_id as string),
      enabled: open && Boolean(drop.status_id),
      staleTime: 30_000,
    })),
  });

  const loading = open && results.some((r) => r.isPending);

  // Grouped by drop in leaderboard order, newest proof first within each — so
  // scrolling walks the player's haul one item at a time rather than
  // interleaving items by timestamp.
  const slides: Slide[] = [];
  drops.forEach((drop, i) => {
    const proofs = results[i]?.data ?? [];
    proofs
      .filter((p): p is BotwProof & { img_path: string } => Boolean(p.img_path))
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .forEach((p) => {
        slides.push({
          src: p.img_path,
          itemName: drop.name,
          points: drop.points,
          triggerId: drop.trigger_id,
          timestamp: new Date(p.created_at),
        });
      });
  });

  const targetIndex = initialTriggerId
    ? slides.findIndex((s) => s.triggerId === initialTriggerId)
    : 0;

  // Jump to the clicked drop once its proofs have arrived. Runs again when
  // targetIndex settles from -1 (still loading) to a real position.
  //
  // No setSelectedIndex here: scrollTo emits Embla's `select`, which the
  // subscription below turns into state. Setting it here as well would be a
  // second source of truth and a cascading render.
  useEffect(() => {
    if (!carouselApi || !open) return;
    carouselApi.scrollTo(targetIndex >= 0 ? targetIndex : 0, true);
  }, [carouselApi, open, targetIndex]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

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
      <DialogContent className="sm:min-w-[70vw] sm:max-w-[95vw] sm:h-[85vh] p-0 overflow-hidden gap-0 flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-foreground/10 shrink-0">
          <DialogTitle className="text-2xl font-bold tracking-tight pr-8">
            {current?.itemName ?? "Drops"}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mt-1">
            <span className="text-base font-semibold uppercase tracking-wide text-foreground/80">
              {playerName}
            </span>
            {current && (
              <span className="text-base font-semibold tabular-nums text-stability-accent">
                {current.points} pts
              </span>
            )}
            {current && (
              <span className="flex items-center gap-2 text-base">
                <Calendar className="size-4" />
                {formatDate(current.timestamp)}
              </span>
            )}
            {slides.length > 1 && (
              <span className="flex items-center gap-2 text-base font-medium ml-auto">
                <Images className="size-4" />
                {selectedIndex + 1} of {slides.length}
              </span>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Loading…
          </div>
        ) : slides.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ImageOff className="size-10" />
            <p className="text-lg">No screenshots for this player yet.</p>
          </div>
        ) : (
          <Carousel
            setApi={setCarouselApi}
            opts={{ loop: false }}
            className="flex-1 min-h-0 flex flex-col"
          >
            <CarouselContent className="flex-1 min-h-0 ml-0">
              {slides.map((slide, i) => (
                <CarouselItem
                  key={`${slide.triggerId}-${i}`}
                  className="pl-0 h-full"
                >
                  <div className="relative w-full h-full min-h-[50vh] bg-black/20">
                    <Image
                      src={slide.src}
                      alt={slide.itemName}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
