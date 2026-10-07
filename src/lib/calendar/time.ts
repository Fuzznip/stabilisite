/** Clan times are US Eastern. Dates here are ET calendar days ("YYYY-MM-DD")
 *  and times ET wall-clock ("HH:mm"); everything stored is UTC. Kept free of
 *  imports so it runs anywhere, server or client. */

export const CLAN_TZ = "America/New_York";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLAN_TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function etParts(instant: Date): Record<string, number> {
  const parts: Record<string, number> = {};
  for (const part of partsFormatter.formatToParts(instant)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  return parts;
}

/** Minutes ET is offset from UTC at `instant`: -240 in summer, -300 in winter. */
function etOffsetMinutes(instant: Date): number {
  const p = etParts(instant);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The UTC instant of an ET wall-clock date and time. */
export function etToUtc(date: string, time = "00:00"): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, hh, mm);
  // Guess with the offset at the wall time, then correct once in case the
  // guess landed on the other side of a DST change.
  const guess = wall - etOffsetMinutes(new Date(wall)) * 60_000;
  return new Date(wall - etOffsetMinutes(new Date(guess)) * 60_000);
}

export function utcToEt(instant: Date): { date: string; time: string } {
  const p = etParts(instant);
  return {
    date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
    time: `${pad(p.hour)}:${pad(p.minute)}`,
  };
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** The dialog's inputs: an inclusive ET day range with optional times. */
export type EntryWindow = {
  firstDay: string;
  lastDay: string;
  startTime?: string;
  endTime?: string;
};

/** Dialog inputs → stored UTC range. With no times it is all-day: midnight
 *  ET on the first day to midnight ET after the last (end exclusive). */
export function windowToUtc(w: EntryWindow): {
  start: Date;
  end: Date;
  allDay: boolean;
} {
  const dayAfterLast = etToUtc(addDays(w.lastDay, 1));
  if (!w.startTime && !w.endTime) {
    return { start: etToUtc(w.firstDay), end: dayAfterLast, allDay: true };
  }
  return {
    start: etToUtc(w.firstDay, w.startTime || "00:00"),
    end: w.endTime ? etToUtc(w.lastDay, w.endTime) : dayAfterLast,
    allDay: false,
  };
}

/** Stored UTC range → dialog inputs, for editing. */
export function utcToWindow(start: Date, end: Date, allDay: boolean): EntryWindow {
  const s = utcToEt(start);
  if (allDay) {
    return { firstDay: s.date, lastDay: addDays(utcToEt(end).date, -1) };
  }
  const e = utcToEt(end);
  return { firstDay: s.date, lastDay: e.date, startTime: s.time, endTime: e.time };
}
