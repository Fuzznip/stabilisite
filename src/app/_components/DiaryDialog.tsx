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
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { NotebookPen, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/lib/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { submitDiary } from "../_actions/submitDiary";
import { ShortDiary } from "@/lib/types";

const diarySchema = z.object({
  diary: z.string(),
  scale: z.string(),
  time: z
    .string()
    .regex(/^\d{1,2}:\d{2}:\d{2}$/, "Invalid duration format (HH:MM:SS)"),
  teamMembers: z.array(z.string()).optional(),
  proof: z.any().refine((file) => file instanceof File && file.size > 0, {
    message: "Please upload an image file",
  }),
});

type DiaryForm = z.infer<typeof diarySchema>;

export function DiaryDialog({
  diaries,
}: {
  diaries: ShortDiary[];
}): React.ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState(diaries[0]);
  const [selectedScale, setSelectedScale] = useState(
    diaries[0].scales[0].scale
  );
  const [teamInput, setTeamInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  const form = useForm<DiaryForm>({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      diary: diaries[0].name,
      scale: diaries[0].scales[0].scale,
      time: "",
      teamMembers: [],
      proof: undefined,
    },
  });

  const onSubmit = (data: DiaryForm) => {
    submitDiary({
      ...data,
      shorthand:
        selectedDiary.scales.find((scale) => scale.scale === selectedScale)
          ?.shorthand || "",
    });
    setDialogOpen(false);
    setTimeout(() => form.reset(), 1000);
    setTeamMembers([]);
  };

  const handleTeamAdd = () => {
    if (teamInput && !teamMembers.includes(teamInput)) {
      const updated = [...teamMembers, teamInput];
      setTeamMembers(updated);
      form.setValue("teamMembers", updated);
      setTeamInput("");
    }
  };

  const handleTeamRemove = (name: string) => {
    const updated = teamMembers.filter((m) => m !== name);
    setTeamMembers(updated);
    form.setValue("teamMembers", updated);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-6">
          <NotebookPen className="size-8 mr-1" />
          <span>Diary</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-24 w-[40rem] sm:max-h-4/5 overflow-auto">
        <DialogHeader className="mb-2 flex flex-col gap-1">
          <DialogTitle className="text-xl mb-0">Submit Diary Entry</DialogTitle>
          <DialogDescription className="text-base">
            Submit a diary entry to claim credit for your achievements
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 text-base"
          >
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="diary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground data-[error=true]:text-destructive">
                      Scale
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          const newDiary = diaries.find((d) => d.name === val);
                          if (newDiary) {
                            setSelectedDiary(newDiary);
                            if (
                              !newDiary.scales
                                .map((scale) => scale.scale)
                                .includes(selectedScale)
                            ) {
                              setSelectedScale(newDiary.scales[0].scale);
                              form.setValue("scale", newDiary.scales[0].scale);
                            }
                          }
                          field.onChange(val);
                        }}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select a diary" />
                        </SelectTrigger>
                        <SelectContent>
                          {diaries.map((d) => (
                            <SelectItem key={d.name} value={d.name}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground data-[error=true]:text-destructive">
                      Scale
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          if (value) {
                            setSelectedScale(value);
                            field.onChange(value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a scale">
                            <span className="capitalize">{field.value}</span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDiary?.scales?.map((scale) => (
                            <SelectItem
                              key={scale.scale}
                              value={scale.scale}
                              className="capitalize"
                            >
                              {scale.scale}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground data-[error=true]:text-destructive">
                      Duration (HH:MM:SS)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 01:21:38"
                        {...field}
                        className="w-64 dark:bg-input/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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

            <FormField
              control={form.control}
              name="teamMembers"
              render={() => (
                <FormItem className="flex flex-col w-full max-w-4/5 relative">
                  <FormLabel className="text-muted-foreground data-[error=true]:text-destructive">
                    Party Members
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        id="team"
                        disabled={selectedScale === "solo"}
                        value={teamInput}
                        onChange={(e) => setTeamInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleTeamAdd())
                        }
                        className="w-64 dark:bg-input/30"
                        placeholder="Add team member"
                      />
                      <Button
                        type="button"
                        disabled={selectedScale === "solo"}
                        onClick={handleTeamAdd}
                        className={
                          "w-fit bg-stability hover:bg-stability/90 text-white"
                        }
                      >
                        Add
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div className="flex flex-wrap mt-2 gap-2 max-w-full absolute top-14">
                    {teamMembers.map((name) => (
                      <Badge
                        key={name}
                        variant="outline"
                        className="flex items-center px-2 py-1 rounded-lg text-sm"
                      >
                        {name}
                        <X
                          className="ml-1 h-4 w-4 cursor-pointer"
                          onClick={() => handleTeamRemove(name)}
                        />
                      </Badge>
                    ))}
                  </div>
                </FormItem>
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
        Party Members
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
