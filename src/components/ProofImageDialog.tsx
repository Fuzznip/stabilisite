"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Eye, X, Calendar, User, Package, Loader2 } from "lucide-react";
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

type ProofImage = {
  src: string;
  timestamp?: Date;
  itemName?: string;
  playerName?: string;
};

type ProofImageDialogProps = {
  images: ProofImage[];
  title: string;
  subtitle?: string;
  date?: Date;
  iconSize?: number;
  // Controlled mode — when provided, the trigger button is not rendered
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
};

export function ProofImageDialog({
  images,
  title,
  subtitle,
  date,
  iconSize = 5,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isLoading,
}: ProofImageDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const goToImage = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      carouselApi?.scrollTo(index);
    },
    [carouselApi],
  );

  // Sync carousel selection with state
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  // Keyboard navigation
  useEffect(() => {
    if (!dialogOpen && !isExpanded) return;

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          if (selectedIndex > 0) {
            e.preventDefault();
            goToImage(selectedIndex - 1);
          }
          break;
        case "ArrowRight":
          if (selectedIndex < images.length - 1) {
            e.preventDefault();
            goToImage(selectedIndex + 1);
          }
          break;
        case "Escape":
          if (isExpanded) {
            setIsExpanded(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogOpen, isExpanded, selectedIndex, images.length, goToImage]);

  if (images.length === 0 && !isLoading && !isControlled) return null;

  const currentImage = images[selectedIndex];
  const hasMultipleImages = images.length > 1;

  // Use current image's data if available, fall back to props
  const displayTitle = currentImage?.itemName || title;
  const displaySubtitle = currentImage?.playerName || subtitle;
  const displayDate = currentImage?.timestamp || date;

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {!isControlled && (
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Eye className={`size-${iconSize}`} />
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="fixed inset-0 translate-x-0 translate-y-0 top-0 left-0 w-full h-full max-w-none rounded-none sm:inset-auto sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:min-w-[75vw] sm:max-w-[95vw] sm:h-[90vh] sm:max-h-[90vh] sm:rounded-lg p-0 overflow-hidden gap-0 flex flex-col">
          {/* Header */}
          <DialogHeader className="px-4 pt-4 pb-3 sm:px-8 sm:pt-6 sm:pb-4 border-b border-foreground/10 shrink-0">
            <DialogTitle className="text-xl sm:text-3xl font-bold tracking-tight pr-8">
              {displayTitle}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-muted-foreground mt-1 sm:mt-2">
              {displaySubtitle && (
                <div className="flex items-center gap-2">
                  <User className="size-5" />
                  <span className="text-base">{displaySubtitle}</span>
                </div>
              )}
              {displayDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  <span className="text-base">{formatDate(displayDate)}</span>
                </div>
              )}
              {hasMultipleImages && (
                <div className="flex items-center gap-2 ml-auto">
                  <Package className="size-5" />
                  <span className="text-base font-medium">
                    {selectedIndex + 1} of {images.length}
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Loading state */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="size-10 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Main Image - takes remaining space */}
          {!isLoading && <div className="flex-1 min-h-0 p-6">
            <div
              className="relative w-full h-full bg-black/5 rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => {
                setDialogOpen(false);
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
          </div>}

          {/* Thumbnail Carousel */}
          {hasMultipleImages && (
            <div className="shrink-0 border-t border-foreground/10">
              <div className="px-8 py-5">
                <Carousel
                  opts={{
                    align: "start",
                    dragFree: true,
                  }}
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
                              : "border-foreground/20 hover:border-foreground/40 opacity-50 hover:opacity-100",
                          )}
                        >
                          <Image
                            src={image.src}
                            alt={image.itemName || `Thumbnail ${index + 1}`}
                            fill
                            sizes="80px"
                            unoptimized
                            className="object-cover"
                          />
                          {image.itemName && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5">
                              <span className="text-[10px] text-white truncate block">
                                {image.itemName}
                              </span>
                            </div>
                          )}
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
        </DialogContent>
      </Dialog>

      {/* Fullscreen Expanded View */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
          onClick={() => setIsExpanded(false)}
        >
          {/* Header row */}
          <div
            className="flex items-center justify-between p-6 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-6">
              <div className="px-5 py-3 bg-white/10 text-white rounded-xl backdrop-blur-sm">
                <div className="text-lg font-semibold">{displayTitle}</div>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  {displaySubtitle && <span>{displaySubtitle}</span>}
                  {displayDate && <span>{formatDate(displayDate)}</span>}
                </div>
              </div>
              {hasMultipleImages && (
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

          {/* Image container - fills remaining space */}
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

          {/* Navigation arrows in expanded view */}
          {hasMultipleImages && (
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
