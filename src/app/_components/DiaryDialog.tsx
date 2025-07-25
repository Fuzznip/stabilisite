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
import { DiaryApplication, ShortDiary, User } from "@/lib/types";
import {
  cn,
  getCAForShorthand,
  getScaleDisplay,
  mapDiariesForComabtAchievements,
} from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const speedRunSchema = z
  .object({
    diary: z.string(),
    scale: z.string(),
    time: z
      .string()
      .regex(
        /^\d{1,2}:\d{1,2}.\d{1}$/,
        "Invalid duration format (MM:SS.TICKS)"
      ),
    teamMembers: z.array(z.string()).optional(),
    proof: z.any().refine((file) => file instanceof File && file.size > 0, {
      message: "Please upload an image file",
    }),
  })
  .refine(
    (data) => {
      const scaleValue = Number(data.scale);
      // allow if teamMembers is undefined or if it matches the scale
      return (
        !data.teamMembers ||
        data.teamMembers.length <= scaleValue ||
        scaleValue === 0
      );
    },
    {
      message: "Number of team members must not exceed the scale",
      path: ["teamMembers"], // show the error under teamMembers
    }
  );

type SpeedRunZodForm = z.infer<typeof speedRunSchema>;

export function DiaryDialog({
  user,
  diaries,
  entries,
}: {
  user?: User | null;
  diaries: ShortDiary[];
  entries: DiaryApplication[];
}): React.ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const acceptedDiaryNames = entries
    .filter((entry) => entry.status === "Accepted")
    .map((entry) => entry.name);
  const achievementDiaries = diaries
    .filter((diary) => diary.scales.filter((scale) => !scale.diaryTime).length)
    .filter(
      (diary) =>
        !acceptedDiaryNames.includes(diary.name) || diary.scales.length > 1
    )
    .map((diary) =>
      diary.name === "Combat Achievements"
        ? mapDiariesForComabtAchievements(diary, entries)
        : diary
    )
    .filter((diary) => !!diary);
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-6">
          <NotebookPen className="size-4 mr-1" />
          <span>Diary</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-24 w-[40rem] h-fit overflow-auto items-start flex-col">
        <DialogHeader className="mb-2 flex flex-col gap-1 text-left">
          <DialogTitle className="text-xl mb-0">Submit Diary Entry</DialogTitle>
          <DialogDescription className="text-base">
            Submit a diary entry to claim credit for your achievements
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="speedRun" className="h-[32rem] flex flex-col">
          <TabsList className="py-1 h-auto mb-4 w-full">
            <TabsTrigger
              value="speedRun"
              className="flex items-center text-lg w-1/2"
            >
              Speed Run
            </TabsTrigger>
            <TabsTrigger
              value="achievement"
              className="flex items-center text-lg w-1/2"
            >
              Achievement
            </TabsTrigger>
          </TabsList>
          <TabsContent value="speedRun" className="h-full flex flex-col">
            <SpeedRunForm
              user={user}
              diaries={diaries.filter(
                (diary) =>
                  diary.scales.filter((scale) => scale.diaryTime).length > 0
              )}
              setDialogOpen={setDialogOpen}
            />
          </TabsContent>
          <TabsContent value="achievement" className="h-full flex flex-col">
            {achievementDiaries.length ? (
              <AchievementForm
                user={user}
                diaries={achievementDiaries}
                setDialogOpen={setDialogOpen}
              />
            ) : (
              <div className=" text-lg w-fit mx-auto mt-36 text-center">
                You&apos;re a certified gamer! Go touch grass or wait for more
                achievements to be added.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SpeedRunForm({
  user,
  diaries,
  setDialogOpen,
}: {
  user?: User | null;
  diaries: ShortDiary[];
  setDialogOpen: (value: boolean) => void;
}): React.ReactElement {
  const [selectedDiary, setSelectedDiary] = useState(diaries[0]);
  const [selectedScale, setSelectedScale] = useState(
    diaries[0].scales[0].scale
  );
  const [teamInput, setTeamInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([
    user?.runescapeName || "",
  ]);

  const defaultForm = {
    diary: diaries[0].name,
    scale: diaries[0].scales[0].scale,
    time: "",
    teamMembers: [user?.runescapeName || ""],
    proof: undefined,
  };

  const form = useForm<SpeedRunZodForm>({
    resolver: zodResolver(speedRunSchema),
    defaultValues: defaultForm,
  });

  const onSubmit = (data: SpeedRunZodForm) => {
    submitDiary({
      ...data,
      shorthand:
        selectedDiary.scales.find((scale) => scale.scale === selectedScale)
          ?.shorthand || "",
      scale: Number(selectedScale),
    })
      .then(() => {
        toast.success(
          `Your ${selectedDiary.name} (${getScaleDisplay(
            selectedScale
          )}) diary was submitted and is under review.`
        );
        form.reset(defaultForm);
        setTeamMembers([user?.runescapeName || ""]);
      })
      .catch((err) => {
        toast.error(
          `There was an error submitting your ${
            selectedDiary.name
          } (${getScaleDisplay(selectedScale)}) diary: ${err}`,
          { duration: 10000 }
        );
        form.reset(defaultForm);
      });
    setDialogOpen(false);
    setTeamMembers([user?.runescapeName || ""]);
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
    <div className="h-full flex flex-col">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 gap-4 text-base"
        >
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="diary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="data-[error=true]:text-destructive">
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
                  <FormLabel className="data-[error=true]:text-destructive">
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
                          <span className="capitalize">
                            {getScaleDisplay(field.value)}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDiary?.scales?.map((scale) => (
                          <SelectItem
                            key={scale.scale}
                            value={scale.scale}
                            className="capitalize"
                          >
                            {getScaleDisplay(scale.scale)}
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
                  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
                  return `${pad(m || 0)}:${pad(s || 0)}.${String(ms || 0)}`;
                };

                const { minutes, seconds, milliseconds } = parseTime(
                  field.value ?? "00:00.00"
                );

                return (
                  <FormItem>
                    <FormLabel className="data-[error=true]:text-destructive">
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
                          max={9}
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
                          placeholder="TICKS"
                        />
                        <span className="text-muted-foreground">
                          {field.value &&
                            field.value !== "00:00.00" &&
                            `(${field.value}0)`}
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
                <FormLabel className="data-[error=true]:text-destructive">
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
                <div
                  className={cn(
                    "flex flex-wrap gap-2 max-w-full absolute top-14",
                    form.formState.errors.teamMembers ? "mt-8" : "mt-2"
                  )}
                >
                  {teamMembers.map((name) => (
                    <Badge
                      key={name}
                      variant="outline"
                      className="flex items-center px-2 py-1 rounded-lg text-sm capitalize"
                    >
                      {name}
                      {name.toLowerCase() !==
                      user?.runescapeName?.toLowerCase() ? (
                        <X
                          className="ml-1 h-4 w-4 cursor-pointer"
                          onClick={() => handleTeamRemove(name)}
                        />
                      ) : (
                        <></>
                      )}
                    </Badge>
                  ))}
                </div>
              </FormItem>
            )}
          />
          <DialogFooter className="mt-auto">
            <Button
              type="submit"
              className="w-fit ml-auto bg-stability hover:bg-stability/90 text-white"
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}

function AchievementForm({
  user,
  diaries,
  setDialogOpen,
}: {
  user?: User | null;
  diaries: ShortDiary[];
  setDialogOpen: (value: boolean) => void;
}): React.ReactElement {
  const [selectedDiary, setSelectedDiary] = useState(diaries[0]);
  const [selectedShorthand, setSelectedShorthand] = useState(
    diaries[0].scales[0]?.shorthand
  );
  const defaultForm = {
    diary: diaries[0].name,
    scale: diaries[0].scales[0].scale,
    time: "00:00.0",
    teamMembers: [user?.runescapeName || ""],
    proof: undefined,
  };

  const form = useForm<SpeedRunZodForm>({
    resolver: zodResolver(speedRunSchema),
    defaultValues: defaultForm,
  });

  const onSubmit = (data: SpeedRunZodForm) => {
    submitDiary({
      ...data,
      shorthand: selectedShorthand,
      scale: 1,
    })
      .then(() => {
        toast.success(
          `Your ${selectedDiary.name} diary was submitted and is under review.`
        );
        form.reset(defaultForm);
      })
      .catch((err) => {
        toast.error(
          `There was an error submitting your ${selectedDiary.name} diary: ${err}`,
          { duration: 10000 }
        );
        form.reset(defaultForm);
      });
    setDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-auto gap-4 text-base"
        >
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="diary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="data-[error=true]:text-destructive">
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
                              .map((scale) => scale.shorthand)
                              .includes(selectedShorthand)
                          ) {
                            setSelectedShorthand(newDiary.scales[0].shorthand);
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
            {selectedDiary.scales.length > 1 && (
              <FormField
                control={form.control}
                name="scale"
                render={() => (
                  <FormItem>
                    <FormLabel className="data-[error=true]:text-destructive">
                      Tier
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={selectedShorthand}
                        onValueChange={(val) => {
                          setSelectedShorthand(val);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a diary" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDiary.scales.map((scale) => (
                            <SelectItem
                              key={scale.shorthand}
                              value={scale.shorthand}
                            >
                              {getCAForShorthand(scale.shorthand)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
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
          <DialogFooter className="mt-auto">
            <Button
              type="submit"
              className="w-fit ml-auto bg-stability hover:bg-stability/90 text-white"
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
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
      <FormLabel className="data-[error=true]:text-destructive">
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
