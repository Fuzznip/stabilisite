import { Card } from "@/components/ui/card";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

export default function ProofField({
  onFileSelect,
}: {
  onFileSelect: (files: File[]) => void;
}) {
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
        const urls = acceptedFiles.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
        onFileSelect(acceptedFiles);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
  });

  return (
    <FormItem className="flex flex-col w-full relative gap-2">
      <FormLabel>Proof</FormLabel>
      <FormDescription>
        Make sure to show all requirements in the provided screenshots!
      </FormDescription>
      <FormControl>
        <Card
          {...getRootProps()}
          className={`border-dashed border-2 cursor-pointer transition-all h-48 overflow-y-auto w-full flex items-center justify-center text-sm text-muted-foreground dark:bg-input/30 ${
            isDragActive ? "border-primary bg-muted" : "border-muted"
          }`}
        >
          <input {...getInputProps()} />
          {previews.length ? (
            <div className="flex gap-2 flex-col items-center px-2">
              {previews.map((src, i) => (
                <div key={i} className="relative w-32 h-32 shrink-0">
                  <Image
                    src={src}
                    alt={`Proof ${i + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mx-auto w-fit text-center">
              Drag & drop or click to upload your screenshots
            </p>
          )}
        </Card>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
