"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ProofImage = {
  src: string;
  timestamp?: Date;
};

type ProofImageDialogProps = {
  images: ProofImage[];
  title: string;
  iconSize?: number;
};

export function ProofImageDialog({
  images,
  title,
  iconSize = 5,
}: ProofImageDialogProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  const isSingleImage = images.length === 1;

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Eye className={`size-${iconSize}`} />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {isSingleImage ? (
            <div
              className="relative aspect-video w-full border rounded overflow-hidden mt-4 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setExpandedImage(images[0].src)}
            >
              <Image
                src={images[0].src}
                alt="Proof image"
                fill
                sizes="100%"
                unoptimized
                className="object-contain"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div
                    className="relative aspect-video w-full border rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setExpandedImage(image.src)}
                  >
                    <Image
                      src={image.src}
                      alt="Proof image"
                      fill
                      sizes="100%"
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  {image.timestamp && (
                    <span className="text-sm text-muted-foreground">
                      {image.timestamp.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
          onClick={() => setExpandedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setExpandedImage(null)}
          >
            <X className="size-8" />
          </Button>
          <div
            className="relative w-[90vw] h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={expandedImage}
              alt="Expanded proof image"
              fill
              sizes="90vw"
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
