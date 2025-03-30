"use client";

import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
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
import { Label } from "@/lib/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import { cn, diaries, formatDate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, NotebookPen, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/lib/components/ui/card";

const diarySchema = z.object({
  diary: z.string(),
  scale: z.string(),
  time: z
    .string()
    .regex(/^\d{1,2}:\d{2}:\d{2}$/, "Invalid duration format (HH:MM:SS)"),
  date: z.date({
    required_error: "A date of birth is required.",
  }),
  teamMembers: z.array(z.string()).optional(),
});

type DiaryForm = z.infer<typeof diarySchema>;

export function DiaryDialog(): React.ReactElement {
  const [selectedDiary, setSelectedDiary] = useState(diaries[0]);
  const [selectedScale, setSelectedScale] = useState(diaries[0].scales[0]);
  const [teamInput, setTeamInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { control, register, setValue, handleSubmit, reset } =
    useForm<DiaryForm>({
      resolver: zodResolver(diarySchema),
      defaultValues: {
        diary: selectedDiary.name,
        scale: selectedScale,
        time: "",
        date: new Date(),
        teamMembers: [],
      },
    });

  useEffect(() => {
    if (selectedDate) {
      setValue("date", selectedDate);
    }
  }, [selectedDate, setValue]);

  const onSubmit = (data: DiaryForm) => {
    console.log("Form Submitted:", data);
    reset();
    setTeamMembers([]);
  };

  const handleTeamAdd = () => {
    if (teamInput && !teamMembers.includes(teamInput)) {
      const updated = [...teamMembers, teamInput];
      setTeamMembers(updated);
      setValue("teamMembers", updated);
      setTeamInput("");
    }
  };

  const handleTeamRemove = (name: string) => {
    const updated = teamMembers.filter((m) => m !== name);
    setTeamMembers(updated);
    setValue("teamMembers", updated);
  };

  return (
    <Dialog>
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 text-base"
        >
          <div className="flex flex-col">
            <Controller
              name="date"
              control={control}
              render={() => (
                <div className="flex flex-col">
                  <Label className="text-muted-foreground mb-2">Date</Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-64 px-3 dark:bg-input/30",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {selectedDate ? (
                          formatDate(selectedDate)
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-auto"
                      side="bottom"
                      collisionPadding={-100}
                    >
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(value) => {
                          setSelectedDate(value);
                          setDateOpen(false);
                        }}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            />
          </div>
          <div className="flex gap-4">
            <Controller
              name="diary"
              control={control}
              render={({ field }) => (
                <div>
                  <Label className="text-muted-foreground mb-2">Diary</Label>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      const newDiary = diaries.find((d) => d.name === val);
                      if (newDiary) {
                        setSelectedDiary(newDiary);
                        if (!newDiary.scales.includes(selectedScale)) {
                          console.log(
                            "new ",
                            newDiary.scales[0],
                            selectedScale
                          );
                          setSelectedScale(newDiary.scales[0]);
                          setValue("scale", newDiary.scales[0]);
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
                </div>
              )}
            />
            <Controller
              name="scale"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <Label className="text-muted-foreground mb-2">Scale</Label>
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
                          key={scale}
                          value={scale}
                          className="capitalize"
                        >
                          {scale}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>

          <div className="flex flex-col">
            <Label htmlFor="time" className="text-muted-foreground mb-2">
              Duration
            </Label>
            <Input
              id="time"
              className="w-64 dark:bg-input/30"
              placeholder="e.g. 01:21:38"
              {...register("time")}
              pattern="^\d{1,2}:\d{2}:\d{2}$"
            />
          </div>
          <ProofField onFileSelect={setImageFile} />
          <div className="flex flex-col w-full max-w-4/5 relative">
            <Label htmlFor="team" className="text-muted-foreground mb-2">
              Team Members
            </Label>
            <div className="flex gap-4">
              <Input
                id="team"
                disabled={selectedScale === "solo"}
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleTeamAdd())
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
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-fit ml-auto bg-stability hover:bg-stability/90 text-white"
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
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
    <div className="space-y-2">
      <Label className="text-muted-foreground 2">Proof</Label>
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
    </div>
  );
}
