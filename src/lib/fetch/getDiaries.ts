import { DiaryTimeTarget, ShortDiary } from "@/lib/types";
import { parseDiaryTimeToSeconds } from "@/lib/utils";

type ScaleAccumulator = {
  scale: string;
  shorthand: string;
  diaryTime?: string;
  times: DiaryTimeTarget[];
};

export async function getDiaries(): Promise<ShortDiary[]> {
  const diaryResponse = await fetch(`${process.env.API_URL}/diary`, {
    cache: "force-cache",
  }).then((res) => res.json());

  const grouped = new Map<string, Map<string, ScaleAccumulator>>();

  for (const entry of diaryResponse) {
    const { diary_name, diary_shorthand, scale, diary_time, diary_points } =
      entry;
    if (!scale || !diary_shorthand) continue;

    if (!grouped.has(diary_name)) {
      grouped.set(diary_name, new Map());
    }

    const scaleMap = grouped.get(diary_name)!;
    // A shorthand (diary + party size) can have several time thresholds, each
    // worth a different amount of clan points. Collect them all rather than
    // letting the last one win.
    const existing: ScaleAccumulator = scaleMap.get(diary_shorthand) ?? {
      scale,
      shorthand: diary_shorthand,
      diaryTime: diary_time ?? undefined,
      times: [],
    };
    if (diary_time != null) {
      existing.times.push({ diaryTime: diary_time, diaryPoints: diary_points });
      existing.diaryTime ??= diary_time;
    }
    scaleMap.set(diary_shorthand, existing);
  }

  const diaries = Array.from(grouped.entries())
    .map(([diaryName, scaleMap]) => ({
      name: diaryName,
      scales: Array.from(scaleMap.values())
        .map(({ scale, shorthand, diaryTime, times }) => ({
          scale,
          shorthand,
          diaryTime,
          // Slowest time first (fewest clan points at the top).
          times: times.sort(
            (a, b) =>
              (parseDiaryTimeToSeconds(b.diaryTime) ?? -Infinity) -
              (parseDiaryTimeToSeconds(a.diaryTime) ?? -Infinity)
          ),
        }))
        .sort((a, b) => a.scale.localeCompare(b.scale)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return diaries;
}
