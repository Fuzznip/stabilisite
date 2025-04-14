import { ShortDiary } from "@/lib/types";

export async function getDiaries(): Promise<ShortDiary[]> {
  const diaryResponse = await fetch(`${process.env.API_URL}/diary`, {
    cache: "force-cache",
  }).then((res) => res.json());

  const grouped = new Map<
    string,
    Map<string, { scale: string; shorthand: string; diaryTime?: string }>
  >();

  for (const entry of diaryResponse) {
    const { diary_name, diary_shorthand, scale, diary_time } = entry;
    if (!scale || !diary_shorthand) continue;

    if (!grouped.has(diary_name)) {
      grouped.set(diary_name, new Map());
    }

    const scaleMap = grouped.get(diary_name)!;
    scaleMap.set(diary_shorthand, {
      scale: scale,
      shorthand: diary_shorthand,
      diaryTime: diary_time ?? undefined,
    });
  }

  const diaries = Array.from(grouped.entries())
    .map(([diaryName, scaleMap]) => ({
      name: diaryName,
      scales: Array.from(scaleMap.entries())
        .map(([, { scale, shorthand, diaryTime }]) => ({
          scale,
          shorthand,
          diaryTime,
        }))
        .sort((a, b) => a.scale.localeCompare(b.scale)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return diaries;
}
