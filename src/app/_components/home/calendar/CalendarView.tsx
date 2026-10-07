"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addMonths, monthLabel } from "@/lib/calendar/grid";
import type { CalendarActivity } from "@/lib/calendar/activity";
import type { CalendarEntry, CalendarItem } from "@/lib/types/calendar";
import type { Event } from "@/lib/types/v2";
import { AgendaList } from "./AgendaList";
import { CalendarEntryDialog } from "./CalendarEntryDialog";
import { MonthGrid } from "./MonthGrid";

export function CalendarView({
  items,
  activity,
  linkableEvents,
  isAdmin,
  today,
  minMonth,
  maxMonth,
}: {
  items: CalendarItem[];
  activity: CalendarActivity[];
  linkableEvents: Event[];
  isAdmin: boolean;
  today: string;
  minMonth: string;
  maxMonth: string;
}): React.ReactElement {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEntry | null>(null);
  // Bumped on every open so the dialog remounts with fresh form state.
  const [dialogKey, setDialogKey] = useState(0);

  const openDialog = (entry: CalendarEntry | null) => {
    setEditing(entry);
    setDialogKey((key) => key + 1);
    setDialogOpen(true);
  };
  const openNew = () => openDialog(null);
  const openEntry = (entry: CalendarEntry) => openDialog(entry);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/65">
          Calendar
        </h2>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous month"
              disabled={month <= minMonth}
              onClick={() => setMonth(addMonths(month, -1))}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-32 text-center text-sm font-semibold" aria-live="polite">
              {monthLabel(month)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next month"
              disabled={month >= maxMonth}
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={openNew}>
              <Plus /> New event
            </Button>
          )}
        </div>
      </div>

      <div className="hidden sm:block">
        <MonthGrid
          month={month}
          today={today}
          items={items}
          activity={activity}
          isAdmin={isAdmin}
          onSelectEntry={openEntry}
        />
      </div>
      <div className="sm:hidden">
        <AgendaList items={items} today={today} isAdmin={isAdmin} onSelectEntry={openEntry} />
      </div>
      {isAdmin && (
        <CalendarEntryDialog
          key={dialogKey}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          entry={editing}
          linkableEvents={linkableEvents}
        />
      )}
    </section>
  );
}
