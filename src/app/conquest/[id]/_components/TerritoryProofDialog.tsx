"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { X, Calendar, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { TerritoryProofEntry } from "@/lib/types/v2";

async function fetchProofs(
  territoryId: string,
  teamId: string
): Promise<TerritoryProofEntry[]> {
  const res = await fetch(
    `/api/conquest/territories/${territoryId}/proofs?team_id=${teamId}`
  );
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
}

type ProofImage = {
  src: string;
  timestamp?: Date;
  itemName?: string;
  playerName?: string;
};

interface TerritoryProofDialogProps {
  territoryId: string;
  teamId: string;
  triggerName: string | null;
  createdAt?: string;
  /** When set, only shows proofs whose action name matches this value */
  filterByActionName?: string;
  /** Controlled open state — when provided, no children trigger is needed */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function TerritoryProofDialog({
  territoryId,
  teamId,
  triggerName,
  createdAt,
  filterByActionName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}: TerritoryProofDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const dialogOpen = isControlled ? controlledOpen! : internalOpen;

  useEffect(() => {
    if (dialogOpen) setEnabled(true);
  }, [dialogOpen]);

  function handleOpenChange(v: boolean) {
    if (isControlled) {
      controlledOnOpenChange?.(v);
    } else {
      setInternalOpen(v);
      if (v) setEnabled(true);
    }
  }
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const { data: proofs = [], isPending } = useQuery<TerritoryProofEntry[]>({
    queryKey: ["territory-proofs", territoryId, teamId],
    queryFn: () => fetchProofs(territoryId, teamId),
    enabled,
    staleTime: 30_000,
  });

  const allImages: ProofImage[] = proofs
    .filter(
      (p): p is TerritoryProofEntry & { img_path: string } =>
        typeof p.img_path === "string" && p.img_path.length > 0
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map((p) => ({
      src: p.img_path,
      timestamp: new Date(p.created_at),
      itemName: p.action?.name ?? triggerName ?? undefined,
      playerName: p.action?.player?.runescape_name ?? undefined,
    }));

  const filteredImages = filterByActionName
    ? allImages.filter((img) => img.itemName === filterByActionName)
    : allImages;

  // If a specific log timestamp is provided, show only the closest-matching proof
  const images: ProofImage[] = createdAt
    ? (() => {
        const logTime = new Date(createdAt).getTime();
        const closest = filteredImages.reduce<ProofImage | null>((best, img) => {
          if (!best) return img;
          const diff = Math.abs((img.timestamp?.getTime() ?? 0) - logTime);
          const bestDiff = Math.abs((best.timestamp?.getTime() ?? 0) - logTime);
          return diff < bestDiff ? img : best;
        }, null);
        return closest ? [closest] : filteredImages;
      })()
    : filteredImages;

  const goToImage = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      carouselApi?.scrollTo(index);
    },
    [carouselApi]
  );

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!dialogOpen && !isExpanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && selectedIndex > 0) {
        e.preventDefault();
        goToImage(selectedIndex - 1);
      } else if (e.key === "ArrowRight" && selectedIndex < images.length - 1) {
        e.preventDefault();
        goToImage(selectedIndex + 1);
      } else if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isExpanded, selectedIndex, images.length, goToImage]);

  const currentImage = images[selectedIndex];
  const hasMultiple = images.length > 1;

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}

        <DialogContent className="fixed inset-0 translate-x-0 translate-y-0 top-0 left-0 w-full h-full max-w-none rounded-none sm:inset-auto sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:min-w-[75vw] sm:max-w-[95vw] sm:h-[90vh] sm:max-h-[90vh] sm:rounded-lg p-0 overflow-hidden gap-0 flex flex-col">
          <DialogHeader className="px-4 pt-4 pb-3 sm:px-8 sm:pt-6 sm:pb-4 border-b border-foreground/10 shrink-0">
            <DialogTitle className="text-xl sm:text-3xl font-bold tracking-tight pr-8">
              {currentImage?.itemName ?? triggerName ?? "Proof Images"}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-muted-foreground mt-1 sm:mt-2">
              {currentImage?.playerName && (
                <div className="flex items-center gap-2">
                  <User className="size-5" />
                  <span className="text-base">{currentImage.playerName}</span>
                </div>
              )}
              {currentImage?.timestamp && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  <span className="text-base">
                    {formatDate(currentImage.timestamp)}
                  </span>
                </div>
              )}
              {hasMultiple && (
                <div className="flex items-center gap-2 ml-auto">
                  <Package className="size-5" />
                  <span className="text-base font-medium">
                    {selectedIndex + 1} of {images.length}
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>

          {isPending ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : images.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No proof images found
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 p-6">
                <div
                  className="relative w-full h-full bg-black/5 rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => {
                    handleOpenChange(false);
                    setIsExpanded(true);
                  }}
                >
                  <Image
                    src={currentImage.src}
                    alt="Proof image"
                    fill
                    sizes="(max-width: 1400px) 95vw, 1400px"
                    unoptimized
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/70 text-white text-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                    Click to expand
                  </div>
                </div>
              </div>

              {hasMultiple && (
                <div className="shrink-0 border-t border-foreground/10">
                  <div className="px-8 py-5">
                    <Carousel
                      opts={{ align: "start", dragFree: true }}
                      setApi={setCarouselApi}
                      className="w-full"
                    >
                      <CarouselContent className="p-2">
                        {images.map((image, index) => (
                          <CarouselItem key={index} className="pl-3 basis-auto">
                            <button
                              onClick={() => goToImage(index)}
                              className={cn(
                                "relative size-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                                selectedIndex === index
                                  ? "border-foreground ring-2 ring-foreground/20 scale-105"
                                  : "border-foreground/20 hover:border-foreground/40 opacity-50 hover:opacity-100"
                              )}
                            >
                              <Image
                                src={image.src}
                                alt={image.itemName ?? `Thumbnail ${index + 1}`}
                                fill
                                sizes="80px"
                                unoptimized
                                className="object-cover"
                              />
                            </button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {images.length > 8 && (
                        <>
                          <CarouselPrevious className="left-0 -translate-x-1/2 size-10" />
                          <CarouselNext className="right-0 translate-x-1/2 size-10" />
                        </>
                      )}
                    </Carousel>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {isExpanded && currentImage && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="flex items-center justify-between p-6 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-6">
              <div className="px-5 py-3 bg-white/10 text-white rounded-xl backdrop-blur-sm">
                <div className="text-lg font-semibold">
                  {currentImage.itemName ?? triggerName ?? "Proof"}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  {currentImage.playerName && (
                    <span>{currentImage.playerName}</span>
                  )}
                  {currentImage.timestamp && (
                    <span>{formatDate(currentImage.timestamp)}</span>
                  )}
                </div>
              </div>
              {hasMultiple && (
                <div className="px-4 py-2 bg-white/10 text-white text-base rounded-full backdrop-blur-sm font-medium">
                  {selectedIndex + 1} / {images.length}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 size-14"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
            >
              <X className="size-10" />
            </Button>
          </div>

          <div
            className="flex-1 relative mx-6 mb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.src}
              alt="Expanded proof image"
              fill
              sizes="95vw"
              unoptimized
              className="object-contain"
              priority
            />
          </div>

          {hasMultiple && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-6 bottom-1/2 text-white hover:bg-white/10 size-16 disabled:opacity-20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(selectedIndex - 1);
                }}
                disabled={selectedIndex === 0}
              >
                <svg
                  className="size-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 bottom-1/2 text-white hover:bg-white/10 size-16 disabled:opacity-20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(selectedIndex + 1);
                }}
                disabled={selectedIndex === images.length - 1}
              >
                <svg
                  className="size-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}
