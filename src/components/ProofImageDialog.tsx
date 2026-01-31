"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Eye, X, Calendar, User, Package } from "lucide-react";
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
};

export function ProofImageDialog({
  images,
  title,
  subtitle,
  date,
  iconSize = 5,
}: ProofImageDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const handleThumbnailClick = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      carouselApi?.scrollTo(index);
    },
    [carouselApi],
  );

  const handleCarouselSelect = useCallback(() => {
    if (!carouselApi) return;
    setSelectedIndex(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  const handleApiChange = useCallback(
    (api: CarouselApi) => {
      setCarouselApi(api);
      if (!api) return;
      api.on("select", handleCarouselSelect);
    },
    [handleCarouselSelect],
  );

  if (images.length === 0) return null;

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
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Eye className={`size-${iconSize}`} />
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-[75vw] max-w-[95vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden gap-0 flex flex-col">
          {/* Header */}
          <DialogHeader className="px-8 pt-6 pb-4 border-b border-foreground/10 shrink-0">
            <DialogTitle className="text-3xl font-bold tracking-tight">
              {displayTitle}
            </DialogTitle>
            <div className="flex items-center gap-6 text-muted-foreground mt-2">
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

          {/* Main Image - takes remaining space */}
          <div className="flex-1 min-h-0 p-6">
            <div
              className="relative w-full h-full bg-black/5 rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setExpandedImage(currentImage.src)}
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

          {/* Thumbnail Carousel */}
          {hasMultipleImages && (
            <div className="shrink-0 border-t border-foreground/10">
              <div className="px-8 py-5">
                <Carousel
                  opts={{
                    align: "start",
                    dragFree: true,
                  }}
                  setApi={handleApiChange}
                  className="w-full"
                >
                  <CarouselContent className="p-2">
                    {images.map((image, index) => (
                      <CarouselItem key={index} className="pl-3 basis-auto">
                        <button
                          onClick={() => handleThumbnailClick(index)}
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
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
          onClick={() => setExpandedImage(null)}
        >
          {/* Header row */}
          <div className="flex items-center justify-between p-6 shrink-0">
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
              onClick={() => setExpandedImage(null)}
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
              src={expandedImage}
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
                  const newIndex = Math.max(0, selectedIndex - 1);
                  setSelectedIndex(newIndex);
                  setExpandedImage(images[newIndex].src);
                  carouselApi?.scrollTo(newIndex);
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
                  const newIndex = Math.min(
                    images.length - 1,
                    selectedIndex + 1,
                  );
                  setSelectedIndex(newIndex);
                  setExpandedImage(images[newIndex].src);
                  carouselApi?.scrollTo(newIndex);
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
