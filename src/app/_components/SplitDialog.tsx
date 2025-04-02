"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coins } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { submitSplit } from "../_actions/submitSplit";
import { cn } from "@/lib/utils";

const splitSchema = z.object({
  item: z.string({ required_error: "Item name is required" }),
  price: z.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  }),
  teamSize: z.number({
    required_error: "Team size is required",
    invalid_type_error: "Team size must be a number",
  }),
  proof: z
    .any()
    .refine((file) => file instanceof File && file.size > 0, {
      message: "Please upload an image file",
    })
    .optional(),
});

type SplitSchema = z.infer<typeof splitSchema>;

export function SplitDialog(): React.ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<SplitSchema>({
    resolver: zodResolver(splitSchema),
    defaultValues: {
      item: undefined,
      price: undefined,
      teamSize: undefined,
      proof: undefined,
    },
  });

  const onSubmit = (data: SplitSchema) => {
    submitSplit(data);
    setDialogOpen(false);
    setTimeout(() => form.reset(), 1000);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-6">
          <Coins className="size-4 mr-1" />
          <span>Split</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-24 w-[40rem] sm:max-h-4/5 overflow-auto">
        <DialogHeader className="mb-2 flex flex-col gap-1">
          <DialogTitle className="text-xl mb-0">Submit Split</DialogTitle>
          <DialogDescription className="text-base">
            Just got a drop? Make sure to fill this out to make sure it counts
            towards your split GP!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 text-base"
          >
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground data-[error=true]:text-destructive">
                    What was the drop?
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Torva Platebody"
                      {...field}
                      className="w-64 dark:bg-input/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={() => (
                <FormItem>
                  <FormLabel className="text-muted-foreground data-[error=true]:text-destructive">
                    How much did it sell for? (Rounded to nearest million)
                  </FormLabel>
                  <FormDescription></FormDescription>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        placeholder="Enter item price..."
                        {...form.register("price", {
                          valueAsNumber: true,
                        })}
                        className="w-64 dark:bg-input/30"
                      />
                      <div
                        className={cn(
                          "text-muted-foreground flex items-center",
                          (form.getValues().price || 0) / 1000000 >= 10 &&
                            "text-[#23FE9A]"
                        )}
                      >
                        <div className="relative size-4 mr-1">
                          <Image
                            src="/coins.png"
                            alt="coins"
                            className="absolute object-contain"
                            fill
                          />
                        </div>
                        {Math.floor((form.getValues().price || 0) / 1000000)}m
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamSize"
              render={() => (
                <FormItem>
                  <FormLabel className="text-muted-foreground data-[error=true]:text-destructive">
                    How large was the group? (Including yourself)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter team size..."
                      {...form.register("teamSize", {
                        valueAsNumber: true,
                      })}
                      className="w-64 dark:bg-input/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="proof"
              render={() => (
                <ProofField
                  onFileSelect={(file) => {
                    form.setValue("proof", file);
                  }}
                />
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                className="w-fit ml-auto bg-stability hover:bg-stability/90 text-white"
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ProofField({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [],
    },
  });

  return (
    <FormItem className="flex flex-col w-full max-w-4/5 relative">
      <FormLabel className="text-muted-foreground data-[error=true]:text-destructive">
        Proof
      </FormLabel>
      <FormControl>
        <Card
          {...getRootProps()}
          className={`border-dashed border-2 cursor-pointer transition-all h-32 w-full flex items-center justify-center text-sm text-muted-foreground dark:bg-input/30 ${
            isDragActive ? "border-primary bg-muted" : "border-muted"
          }`}
        >
          <input {...getInputProps()} />
          {preview ? (
            <CardContent className="p-0 w-full h-full relative overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </CardContent>
          ) : (
            <p className="mx-auto w-fit text-center">
              Drag & drop or click to upload your screenshot
            </p>
          )}
        </Card>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
