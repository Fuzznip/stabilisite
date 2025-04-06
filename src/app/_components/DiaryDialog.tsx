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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { NotebookPen, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
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
import { getScaleDisplay } from "@/lib/utils";
import { toast } from "sonner";

const diarySchema = z.object({
  diary: z.string(),
  scale: z.string(),
  time: z
    .string()
    .regex(/^\d{1,2}:\d{1,2}.\d{1,2}$/, "Invalid duration format (MM:SS.MS)"),
  teamMembers: z.array(z.string()).optional(),
  proof: z.any().refine((file) => file instanceof File && file.size > 0, {
    message: "Please upload an image file",
  }),
});

type DiaryZodForm = z.infer<typeof diarySchema>;

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

  const form = useForm<DiaryZodForm>({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      diary: diaries[0].name,
      scale: diaries[0].scales[0].scale,
      time: "",
      teamMembers: [],
      proof: undefined,
    },
  });

  const onSubmit = (data: DiaryZodForm) => {
    submitDiary({
      ...data,
      shorthand:
        selectedDiary.scales.find((scale) => scale.scale === selectedScale)
          ?.shorthand || "",
    })
      .then(() => {
        toast.success(
          `Your ${selectedDiary.name} (${getScaleDisplay(
            selectedScale
          )}) diary was submitted`
        );
        form.reset();
      })
      .catch(() => {
        toast.error(
          `There was an error submitting your $${
            selectedDiary.name
          } (${getScaleDisplay(selectedScale)}) diary. Ask Funzip y it no work.`
        );
        form.reset();
      });
    setDialogOpen(false);
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
          <NotebookPen className="size-4 mr-1" />
          <span>Diary</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-24 w-[40rem] sm:max-h-4/5 overflow-auto">
        <DialogHeader className="mb-2 flex flex-col gap-1 text-left">
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
                      Diary
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
                        <SelectTrigger className="w-72">
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
                render={({ field }) => {
                  const parseTime = (value: string) => {
                    const [minSec = "", ms = "0"] = value?.split(".") ?? [];
                    const [m = "0", s = "0"] = minSec.split(":");
                    return {
                      minutes: parseInt(m) || undefined,
                      seconds: parseInt(s) || undefined,
                      milliseconds: parseInt(ms) || undefined,
                    };
                  };

                  const formatTime = (m: number, s: number, ms: number) => {
                    const pad = (n: number, l = 2) =>
                      String(n).padStart(l, "0");
                    return `${pad(m || 0)}:${pad(s || 0)}.${String(
                      ms || 0
                    ).padStart(3, "0")}`;
                  };

                  const { minutes, seconds, milliseconds } = parseTime(
                    field.value ?? "00:00.000"
                  );

                  return (
                    <FormItem>
                      <FormLabel className="text-muted-foreground data-[error=true]:text-destructive">
                        Duration
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min={0}
                            value={minutes}
                            onChange={(e) =>
                              field.onChange(
                                formatTime(
                                  +e.target.value,
                                  seconds || 0,
                                  milliseconds || 0
                                )
                              )
                            }
                            className="w-20 dark:bg-input/30"
                            placeholder="MM"
                          />
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            value={seconds}
                            onChange={(e) =>
                              field.onChange(
                                formatTime(
                                  minutes || 0,
                                  +e.target.value,
                                  milliseconds || 0
                                )
                              )
                            }
                            className="w-20 dark:bg-input/30"
                            placeholder="SS"
                          />
                          <Input
                            type="number"
                            min={0}
                            max={99}
                            value={milliseconds}
                            onChange={(e) =>
                              field.onChange(
                                formatTime(
                                  minutes || 0,
                                  seconds || 0,
                                  +e.target.value
                                )
                              )
                            }
                            className="w-24 dark:bg-input/30"
                            placeholder="MS"
                          />
                          <span className="text-muted-foreground">
                            {field.value &&
                              field.value !== "00:00.000" &&
                              `(${field.value})`}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
                        disabled={selectedScale === "1"}
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
                        disabled={selectedScale === "1"}
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
                sizes="100%"
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
