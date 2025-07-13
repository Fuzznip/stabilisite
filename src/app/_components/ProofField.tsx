import { Card } from "@/components/ui/card";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export default function ProofField({
  onFileSelect,
}: {
  onFileSelect: (files: File[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
        const newPreviews = acceptedFiles.map((file) =>
          URL.createObjectURL(file)
        );
        const newFiles = [...files, ...acceptedFiles];
        setFiles(newFiles);
        setPreviews((prev) => [...prev, ...newPreviews]);
        onFileSelect(newFiles);
      }
    },
    [files, onFileSelect]
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    accept: { "image/*": [] },
    noClick: true,
  });

  return (
    <FormItem className="flex flex-col w-full relative gap-1">
      <FormLabel>Proof</FormLabel>
      <FormDescription className="mb-1">
        Make sure to show all requirements in the provided screenshots!
      </FormDescription>
      <FormControl>
        <div>
          <Button type="button" className="mb-2" onClick={open} size="sm">
            Upload File
          </Button>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {previews.length > 0 && (
              <p className="mx-auto text-muted-foreground w-fit text-sm">
                {previews.length} files uploaded
              </p>
            )}
            {previews.length > 0 ? (
              <Carousel className="relative w-72 h-48 mx-auto px-1 mb-4">
                <CarouselContent>
                  {previews.map((preview, index) => (
                    <CarouselItem key={preview}>
                      <div className="relative w-64 h-48 mx-auto">
                        <Image
                          src={preview}
                          alt={`Proof ${index + 1}`}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious type="button" />
                <CarouselNext type="button" />
              </Carousel>
            ) : (
              <Card
                className={`border-dashed border-2 transition-all h-48 overflow-y-auto w-full flex items-center justify-center text-sm text-muted-foreground dark:bg-input/30 ${
                  isDragActive ? "border-primary bg-muted" : "border-muted"
                }`}
              >
                <p className="mx-auto w-fit text-center px-4">
                  Drag & drop your screenshots here
                </p>
              </Card>
            )}
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
