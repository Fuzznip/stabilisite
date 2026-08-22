"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Calendar, ImageOff, Package, User } from "lucide-react";
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
import { cn, collectionLogItemImage } from "@/lib/utils";
import { CollectionLogDrop } from "@/lib/types";

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Screenshot gallery for collection log drops — one drop from the recent feed,
 * or every drop of an item by one member. Drops Dink sent without a screenshot
 * are kept in the list so the dates still line up with the member's count.
 *
 * Callers pass a `key` tied to whose drops these are, so switching member or
 * item remounts and starts from the first image again.
 */
export function DropGallery({
  open,
  onOpenChange,
  itemId,
  itemName,
  playerName,
  drops,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  itemName: string;
  playerName?: string;
  drops: CollectionLogDrop[];
}): React.ReactElement {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState<string | null>(null);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelected(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const goTo = useCallback(
    (index: number) => {
      setSelected(index);
      carouselApi?.scrollTo(index);
    },
    [carouselApi]
  );

  const current = drops[selected];
  const currentDate = formatDate(current?.obtainedAt);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setZoomed(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-foreground/10">
          <DialogTitle className="flex items-center gap-3 pr-8">
            <Image
              src={collectionLogItemImage(itemId)}
              alt={itemName}
              width={36}
              height={32}
              unoptimized
              className="shrink-0 [image-rendering:pixelated]"
            />
            <span>{itemName}</span>
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mt-1">
            {playerName && (
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {playerName}
              </span>
            )}
            {currentDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {currentDate}
              </span>
            )}
            {drops.length > 1 && (
              <span className="flex items-center gap-1.5 ml-auto">
                <Package className="size-4" />
                {selected + 1} of {drops.length}
              </span>
            )}
          </div>
        </DialogHeader>

        {drops.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">
            No drops recorded.
          </p>
        ) : (
          <div className="p-4 sm:p-6">
            <Carousel setApi={setCarouselApi} className="w-full">
              <CarouselContent>
                {drops.map((drop) => (
                  <CarouselItem key={drop.id}>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/20 flex items-center justify-center">
                      {drop.screenshot ? (
                        <button
                          type="button"
                          onClick={() => setZoomed(drop.screenshot ?? null)}
                          aria-label="Enlarge screenshot"
                          className="absolute inset-0 cursor-zoom-in"
                        >
                          <Image
                            src={drop.screenshot}
                            alt={`${itemName} drop`}
                            fill
                            sizes="(max-width: 640px) 100vw, 768px"
                            className="object-contain"
                          />
                        </button>
                      ) : (
                        <span className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
                          <ImageOff className="size-8" />
                          No screenshot for this drop
                        </span>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {drops.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>

            {drops.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mt-4 pb-1">
                {drops.map((drop, index) => (
                  <button
                    key={drop.id}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Drop ${index + 1}`}
                    aria-current={index === selected}
                    className={cn(
                      "relative shrink-0 w-20 h-14 rounded overflow-hidden bg-black/20",
                      "border-2 transition-colors cursor-pointer",
                      index === selected
                        ? "border-stability"
                        : "border-transparent hover:border-foreground/30"
                    )}
                  >
                    {drop.screenshot ? (
                      <Image
                        src={drop.screenshot}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <ImageOff className="size-4 m-auto text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>

      <Dialog open={!!zoomed} onOpenChange={(next) => !next && setZoomed(null)}>
        <DialogContent className="max-w-none w-auto sm:max-w-none bg-transparent border-0 shadow-none p-0 gap-0">
          <DialogTitle className="sr-only">{itemName} screenshot</DialogTitle>
          {zoomed && (
            <button
              type="button"
              onClick={() => setZoomed(null)}
              aria-label="Close enlarged screenshot"
              className="relative block w-[95vw] h-[90vh] cursor-zoom-out"
            >
              <Image
                src={zoomed}
                alt={`${itemName} drop`}
                fill
                sizes="95vw"
                className="object-contain"
              />
            </button>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
