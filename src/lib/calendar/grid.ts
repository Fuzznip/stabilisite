import { addDays, etToUtc, utcToEt } from "./time";

/** How far the home calendar can page, relative to the current ET month. */
export const MONTHS_BACK = 1;
export const MONTHS_AHEAD = 6;

export type DayCell = { date: string; inMonth: boolean };

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Sunday-first weeks covering `month`, padded with neighbouring days. */
export function monthWeeks(month: string): DayCell[][] {
  const [y, m] = month.split("-").map(Number);
  const leading = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  let cursor = addDays(`${month}-01`, -leading);
  const weeks: DayCell[][] = [];
  do {
    const week: DayCell[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({ date: cursor, inMonth: cursor.startsWith(month) });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  } while (cursor.startsWith(month));
  return weeks;
}

/** The ET days an item touches, inclusive. Ends are exclusive, so an entry
 *  ending at midnight does not spill onto the next day. */
export function itemDays(start: Date, end: Date): { first: string; last: string } {
  return {
    first: utcToEt(start).date,
    last: utcToEt(new Date(end.getTime() - 1)).date,
  };
}

export type Span<T> = {
  item: T;
  startCol: number; // 0–6
  endCol: number; // exclusive, 1–7
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
};

/** Places items into stacked lanes for one week row. Items that don't fit in
 *  `maxLanes` are returned per column in `hidden` for a "+N more". */
export function layoutWeek<T extends { start: Date; end: Date }>(
  week: DayCell[],
  items: T[],
  maxLanes: number,
): { spans: Span<T>[]; hidden: T[][] } {
  const weekFirst = week[0].date;
  const weekLast = week[6].date;
  const column = (date: string) => week.findIndex((d) => d.date === date);

  const candidates = items
    .map((item) => ({ item, ...itemDays(item.start, item.end) }))
    .filter((c) => c.first <= weekLast && c.last >= weekFirst)
    // Earlier first, then longer first, so long bars claim the top lanes.
    .sort((a, b) => a.first.localeCompare(b.first) || b.last.localeCompare(a.last));

  const laneEnds: number[] = [];
  const spans: Span<T>[] = [];
  const hidden: T[][] = Array.from({ length: 7 }, () => []);

  for (const c of candidates) {
    const startCol = c.first < weekFirst ? 0 : column(c.first);
    const endCol = c.last > weekLast ? 7 : column(c.last) + 1;
    let lane = laneEnds.findIndex((end) => end <= startCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = endCol;

    if (lane >= maxLanes) {
      for (let col = startCol; col < endCol; col++) hidden[col].push(c.item);
      continue;
    }
    spans.push({
      item: c.item,
      startCol,
      endCol,
      lane,
      continuesBefore: c.first < weekFirst,
      continuesAfter: c.last > weekLast,
    });
  }
  return { spans, hidden };
}

/** The months the home calendar may show, and the UTC range to fetch for them. */
export function calendarWindow(now: Date): {
  minMonth: string;
  maxMonth: string;
  from: Date;
  to: Date;
} {
  const month = utcToEt(now).date.slice(0, 7);
  const minMonth = addMonths(month, -MONTHS_BACK);
  const maxMonth = addMonths(month, MONTHS_AHEAD);
  return {
    minMonth,
    maxMonth,
    from: etToUtc(`${minMonth}-01`),
    to: etToUtc(`${addMonths(maxMonth, 1)}-01`),
  };
}
