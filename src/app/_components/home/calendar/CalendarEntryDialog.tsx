"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  ImagePlus,
  MapPin,
  Podcast,
  TriangleAlert,
  Volume2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createCalendarEntry,
  deleteCalendarEntry,
  getDiscordChannels,
  updateCalendarEntry,
  uploadCoverPhoto,
} from "@/app/_actions/calendar";
import { calendarTypeLabel } from "@/lib/calendar/items";
import {
  utcToWindow,
  windowToUtc,
  type EntryWindow,
} from "@/lib/calendar/time";
import {
  CALENDAR_ENTRY_TYPES,
  type CalendarEntry,
  type CalendarEntryInput,
  type DiscordChannel,
} from "@/lib/types/calendar";
import type { Event } from "@/lib/types/v2";
import { cn } from "@/lib/utils";

/** Radix Select can't hold an empty value. */
const NO_EVENT = "none";
const UNREACHABLE =
  "Couldn't reach the server. Refresh the page and try again.";
const DISCORD_WARNING =
  "Saved, but the Discord event couldn't be updated. Saving again will retry.";
/** Matches uploadCoverPhoto, which must fit the 8mb server-action body limit. */
const MAX_COVER_BYTES = 7 * 1024 * 1024;
const COVER_TYPES = "image/png,image/jpeg,image/gif,image/webp";
/** What the bot uses when no location is given. */
const DEFAULT_LOCATION = "Clan Hall";

const STEPS = ["Location", "Event info"] as const;

const LOCATION_OPTIONS = [
  {
    type: "stage",
    label: "Stage channel",
    hint: "Great for larger community audio events.",
    Icon: Podcast,
  },
  {
    type: "voice",
    label: "Voice channel",
    hint: "Hang out with voice, video, screenshare, and Go Live.",
    Icon: Volume2,
  },
  {
    type: "external",
    label: "Somewhere else",
    hint: "Text channel, external link, or in-game location.",
    Icon: MapPin,
  },
] as const;

type LocationType = (typeof LOCATION_OPTIONS)[number]["type"];

const schema = z
  .object({
    locationType: z.enum(["stage", "voice", "external"]),
    channelId: z.string(),
    locationText: z
      .string()
      .trim()
      .max(100, "Keep it to 100 characters (Discord's limit)"),
    name: z
      .string()
      .trim()
      .min(1, "Give the event a name")
      .max(100, "Keep it to 100 characters (Discord's limit)"),
    type: z.enum(["bingo", "conquest", "botw", "clog", "adhoc"]),
    range: z.custom<DateRange | undefined>(
      (r) => Boolean((r as DateRange | undefined)?.from),
      {
        message: "Pick a date",
      }
    ),
    startTime: z.string(),
    endTime: z.string(),
    isPublic: z.boolean(),
    syncDiscord: z.boolean(),
    eventId: z.string(),
  })
  .superRefine((values, ctx) => {
    const channelError = locationChannelError(values);
    if (channelError)
      ctx.addIssue({
        code: "custom",
        path: ["channelId"],
        message: channelError,
      });
    if (!values.range?.from) return;
    const { start, end } = windowToUtc(toWindow(values));
    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End must be after start",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const LOCATION_FIELDS = ["locationType", "channelId", "locationText"] as const;

function locationChannelError(
  values: Pick<FormValues, "locationType" | "channelId">
): string | null {
  if (values.locationType === "external" || values.channelId) return null;
  return `Pick a ${values.locationType} channel`;
}

/** The picker works in the browser's local dates; we read them as ET days. */
const dayString = (date: Date) => format(date, "yyyy-MM-dd");
const localDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};

function toWindow(values: FormValues): EntryWindow {
  const from = values.range!.from!;
  return {
    firstDay: dayString(from),
    lastDay: dayString(values.range!.to ?? from),
    startTime: values.startTime || undefined,
    endTime: values.endTime || undefined,
  };
}

/** Says what's picked, so a second click that turned one day into a range
 *  can't go unnoticed. */
function describeRange(range: DateRange | undefined): string {
  if (!range?.from) return "Click one day, or two to make a range.";
  const first = format(range.from, "EEE, MMM d");
  const to = range.to ?? range.from;
  if (dayString(to) === dayString(range.from)) {
    return `${first} — click another day to make it a range.`;
  }
  return `${first} – ${format(to, "EEE, MMM d")}. Click a day to start over.`;
}

function locationDefaults(entry: CalendarEntry | null) {
  // A channel's stage/voice kind isn't stored; it's corrected once channels load.
  if (entry?.location_channel_id) {
    return {
      locationType: "voice" as const,
      channelId: entry.location_channel_id,
      locationText: "",
    };
  }
  return {
    locationType: "external" as const,
    channelId: "",
    locationText: entry?.location ?? "",
  };
}

function defaultsFor(entry: CalendarEntry | null): FormValues {
  if (!entry) {
    return {
      ...locationDefaults(null),
      name: "",
      type: "adhoc",
      range: undefined,
      startTime: "",
      endTime: "",
      isPublic: true,
      syncDiscord: false,
      eventId: NO_EVENT,
    };
  }
  const days = utcToWindow(
    new Date(entry.start_date),
    new Date(entry.end_date),
    entry.all_day
  );
  return {
    ...locationDefaults(entry),
    name: entry.name,
    type: entry.type,
    range: { from: localDate(days.firstDay), to: localDate(days.lastDay) },
    startTime: days.startTime ?? "",
    endTime: days.endTime ?? "",
    isPublic: entry.is_public,
    syncDiscord: entry.sync_discord,
    eventId: entry.event_id ?? NO_EVENT,
  };
}

function toLocation(
  values: FormValues
): Pick<CalendarEntryInput, "location_channel_id" | "location"> {
  if (values.locationType !== "external") {
    return { location_channel_id: values.channelId, location: null };
  }
  return {
    location_channel_id: null,
    location: values.locationText.trim() || null,
  };
}

/** Consecutive runs of one category, keeping the bot's order (uncategorized first). */
function groupByCategory(
  channels: DiscordChannel[]
): { category: string | null; channels: DiscordChannel[] }[] {
  const groups: { category: string | null; channels: DiscordChannel[] }[] = [];
  for (const channel of channels) {
    const last = groups.at(-1);
    if (last && last.category === channel.category) last.channels.push(channel);
    else groups.push({ category: channel.category, channels: [channel] });
  }
  return groups;
}

/** Discord's step bars: filled up to the current step, earlier steps clickable. */
function StepBars({
  step,
  onStep,
}: {
  step: number;
  onStep: (step: number) => void;
}): React.ReactElement {
  return (
    <ol className="grid grid-cols-2 gap-3 pr-8">
      {STEPS.map((label, index) => (
        <li key={label}>
          <button
            type="button"
            disabled={index >= step}
            onClick={() => onStep(index)}
            aria-current={index === step ? "step" : undefined}
            className="flex w-full flex-col gap-2 text-left text-sm disabled:cursor-default enabled:cursor-pointer"
          >
            <span
              className={cn(
                "h-1 rounded-full",
                index <= step ? "bg-primary" : "bg-muted"
              )}
            />
            <span
              className={
                index === step ? "text-primary" : "text-muted-foreground"
              }
            >
              {label}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export function CalendarEntryDialog({
  open,
  onOpenChange,
  entry,
  linkableEvents,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: CalendarEntry | null;
  linkableEvents: Event[];
}): React.ReactElement {
  // The parent remounts this (via `key`) on every open, so state starts fresh.
  // `current` starts as the entry being edited and becomes the new entry after
  // a create, so a retry after a Discord failure updates rather than duplicates.
  const [current, setCurrent] = useState<CalendarEntry | null>(entry);
  const [step, setStep] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // undefined while loading, null when the bot couldn't be asked.
  const [channels, setChannels] = useState<DiscordChannel[] | null | undefined>(
    undefined
  );
  // The saved cover, and a picked file that replaces it on save.
  const [coverUrl, setCoverUrl] = useState<string | null>(
    entry?.cover_image_url ?? null
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultsFor(entry),
  });

  useEffect(() => {
    let cancelled = false;
    getDiscordChannels()
      .catch(() => null)
      .then((list) => {
        if (cancelled) return;
        setChannels(list);
        const saved = entry?.location_channel_id;
        if (saved && list?.find((c) => c.id === saved)?.type === "stage") {
          form.setValue("locationType", "stage");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [entry, form]);

  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile]
  );
  useEffect(() => {
    if (!coverPreview) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  const type = useWatch({ control: form.control, name: "type" });
  const locationType = useWatch({
    control: form.control,
    name: "locationType",
  });
  const eventsOfType = linkableEvents
    .filter((event) => (event.type ?? "bingo") === type)
    .sort((a, b) => +new Date(b.start_date) - +new Date(a.start_date));
  const channelsOf = (kind: DiscordChannel["type"]) =>
    (channels ?? []).filter((c) => c.type === kind);

  const goNext = async () => {
    const values = form.getValues();
    const valid = await form.trigger(["locationText"]);
    const channelError = locationChannelError(values);
    if (channelError) form.setError("channelId", { message: channelError });
    if (valid && !channelError) setStep(1);
  };

  const onPickCover = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_COVER_BYTES) {
      toast.error("Cover photos can be up to 7MB.");
      return;
    }
    setCoverFile(file);
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverUrl(null);
  };

  const onSubmit = async (values: FormValues) => {
    setWarning(null);

    let cover = coverUrl;
    if (coverFile) {
      const body = new FormData();
      body.append("file", coverFile);
      let upload;
      try {
        upload = await uploadCoverPhoto(body);
      } catch (err) {
        console.error("[CalendarEntryDialog] cover upload failed:", err);
        toast.error(UNREACHABLE);
        return;
      }
      if (!upload.success) {
        toast.error(upload.error);
        return;
      }
      cover = upload.url;
      // Kept as the saved cover so a retry doesn't upload it again.
      setCoverUrl(cover);
      setCoverFile(null);
    }

    const { start, end, allDay } = windowToUtc(toWindow(values));
    const input: CalendarEntryInput = {
      name: values.name.trim(),
      type: values.type,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      all_day: allDay,
      is_public: values.isPublic,
      sync_discord: values.syncDiscord,
      event_id:
        values.type !== "adhoc" && values.eventId !== NO_EVENT
          ? values.eventId
          : null,
      ...toLocation(values),
      cover_image_url: cover,
    };

    let result;
    try {
      result = current
        ? await updateCalendarEntry(current.id, input)
        : await createCalendarEntry(input);
    } catch (err) {
      // The action itself failed (offline, or a deploy replaced it).
      console.error("[CalendarEntryDialog] save failed:", err);
      toast.error(UNREACHABLE);
      return;
    }

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    if (result.entry) setCurrent(result.entry);
    if (result.discordSync === "failed") {
      setWarning(DISCORD_WARNING);
      return;
    }
    toast.success(current ? "Event updated" : "Event added to the calendar");
    onOpenChange(false);
  };

  /** A location problem caught only at save sends the user back to fix it. */
  const onInvalid = (errors: Partial<Record<keyof FormValues, unknown>>) => {
    if (LOCATION_FIELDS.some((name) => errors[name])) setStep(0);
  };

  const onDelete = async () => {
    if (!current) return;
    setDeleting(true);
    let result;
    try {
      result = await deleteCalendarEntry(current.id);
    } catch (err) {
      console.error("[CalendarEntryDialog] delete failed:", err);
      toast.error(UNREACHABLE);
      return;
    } finally {
      setDeleting(false);
    }
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    if (result.discordSync === "failed") {
      toast.warning("Deleted, but the Discord event couldn't be removed.");
    } else {
      toast.success("Event deleted");
    }
    onOpenChange(false);
  };

  const submitting = form.formState.isSubmitting;
  const shownCover = coverPreview ?? coverUrl;

  const locationDetail = (option: LocationType): React.ReactNode => {
    if (option !== "external") {
      const options = channelsOf(option);
      return (
        <FormField
          control={form.control}
          name="channelId"
          render={({ field }) => (
            <FormItem>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={channels === undefined}
              >
                <FormControl>
                  <SelectTrigger
                    className="w-full"
                    aria-label={`${option} channel`}
                  >
                    <SelectValue
                      placeholder={
                        channels === undefined
                          ? "Loading channels…"
                          : "Pick a channel"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groupByCategory(options).map((group) => (
                    <SelectGroup key={group.category ?? ""}>
                      {group.category && (
                        <SelectLabel>{group.category}</SelectLabel>
                      )}
                      {group.channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  {field.value &&
                    !options.some((c) => c.id === field.value) && (
                      <SelectItem value={field.value}>
                        Unknown channel ({field.value})
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    return (
      <FormField
        control={form.control}
        name="locationText"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder={DEFAULT_LOCATION}
                autoComplete="off"
                aria-label="Location"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const locationStep = (
    <>
      <FormField
        control={form.control}
        name="locationType"
        render={({ field }) => (
          <FormItem>
            <div
              role="radiogroup"
              aria-label="Location"
              className="flex flex-col gap-2"
            >
              {LOCATION_OPTIONS.map(({ type: option, label, hint, Icon }) => {
                const selected = field.value === option;
                const empty =
                  option !== "external" &&
                  channels !== undefined &&
                  channelsOf(option).length === 0;
                return (
                  <div
                    key={option}
                    className={cn(
                      "rounded-lg border transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={empty && !selected}
                      onClick={() => {
                        field.onChange(option);
                        form.setValue("channelId", "");
                        form.clearErrors("channelId");
                      }}
                      className="flex w-full cursor-pointer items-start gap-3 p-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 size-4 shrink-0 rounded-full border-2",
                          selected
                            ? "border-primary bg-primary shadow-[inset_0_0_0_2px_var(--color-background)]"
                            : "border-muted-foreground"
                        )}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-2 font-medium">
                          <Icon className="size-4" aria-hidden />
                          {label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {empty
                            ? channels === null
                              ? "Couldn't load Discord channels."
                              : `No ${option} channels in the server.`
                            : hint}
                        </span>
                      </span>
                    </button>
                    {selected && (
                      <div className="px-3 pb-3">
                        {locationDetail(option as LocationType)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </FormItem>
        )}
      />
    </>
  );

  const infoStep = (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Fall Bingo" autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("eventId", NO_EVENT);
              }}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CALENDAR_ENTRY_TYPES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {calendarTypeLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="range"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dates</FormLabel>
            <FormControl>
              <Calendar
                mode="range"
                resetOnSelect
                selected={field.value}
                onSelect={field.onChange}
                defaultMonth={field.value?.from}
                className="justify-self-center rounded-md border"
              />
            </FormControl>
            <FormDescription aria-live="polite">
              {describeRange(field.value)}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start time (ET)</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End time (ET)</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {type !== "adhoc" && (
        <FormField
          control={form.control}
          name="eventId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to event</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_EVENT}>Not built yet</SelectItem>
                  {eventsOfType.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Once linked, the entry opens the event page.
              </FormDescription>
            </FormItem>
          )}
        />
      )}

      <div className="grid gap-2">
        <span className="text-sm font-medium">Cover photo</span>
        {shownCover ? (
          // Discord crops covers to 2.5:1 from the centre and shows see-through
          // areas on its dark event card, so the preview does the same in
          // either theme.
          <div className="relative aspect-[5/2] overflow-hidden rounded-lg border bg-[#2b2d31]">
            <Image
              src={shownCover}
              alt="Cover photo"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInput.current?.click()}
            className="flex aspect-[5/2] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/50"
          >
            <ImagePlus className="size-5" aria-hidden />
            Upload a cover photo
          </button>
        )}
        {shownCover && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => coverInput.current?.click()}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeCover}
            >
              Remove
            </Button>
          </div>
        )}
        <input
          ref={coverInput}
          type="file"
          accept={COVER_TYPES}
          className="hidden"
          onChange={(e) => {
            onPickCover(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <p className="text-sm text-muted-foreground">
          Previewed as Discord shows it: cropped to this shape from the
          centre. At least 800×320; 1600×640 looks best.
        </p>
      </div>

      {(["isPublic", "syncDiscord"] as const).map((name) => (
        <FormField
          key={name}
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <FormLabel>
                  {name === "isPublic" ? "Public" : "Sync to Discord"}
                </FormLabel>
                <FormDescription>
                  {name === "isPublic"
                    ? "Show on the home page for everyone. Off means staff only."
                    : "Create a Discord server event and keep it up to date."}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[30rem] max-w-[calc(100%-2rem)] overflow-auto">
        <DialogHeader className="gap-4 text-left">
          <StepBars step={step} onStep={setStep} />
          <DialogTitle className="text-xl">
            {step === 0 ? "Where is your event?" : "Tell us more about your event"}
          </DialogTitle>
          <DialogDescription className={step === 0 ? "sr-only" : undefined}>
            Times are US Eastern. Leave them blank for all-day.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              if (step === 0) {
                e.preventDefault();
                void goNext();
                return;
              }
              void form.handleSubmit(onSubmit, onInvalid)(e);
            }}
            className="flex flex-col gap-4"
          >
            {/* Keyed so each step mounts its own fields: an unkeyed swap would hand
                the location Controller to "name", still bound to locationType. */}
            <Fragment key={step}>{step === 0 ? locationStep : infoStep}</Fragment>

            {warning && (
              <Alert>
                <TriangleAlert />
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
              {current ? (
                confirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Delete this event?</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmingDelete(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deleting}
                      onClick={onDelete}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Delete
                  </Button>
                )
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                {step === 0 ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Next</Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        warning ? onOpenChange(false) : setStep(0)
                      }
                    >
                      {warning ? "Close" : "Back"}
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Saving…" : "Save"}
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
