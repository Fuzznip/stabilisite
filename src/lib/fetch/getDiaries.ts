import { ShortDiary } from "@/lib/types";

export async function getDiaries(): Promise<ShortDiary[]> {
  const diaryResponse = await fetch(`${process.env.API_URL}/diary/categories`, {
    cache: "force-cache",
  }).then((res) => res.json());
  const grouped = new Map<string, Map<string, string>>();

  for (const { diary_name, shorthand, scale } of diaryResponse) {
    if (!scale) continue;

    if (!grouped.has(diary_name)) {
      grouped.set(diary_name, new Map());
    }

    grouped.get(diary_name)!.set(scale, shorthand);
  }
  const diaries = Array.from(grouped.entries())
    .map(([diaryName, scaleMap]) => ({
      name: diaryName,
      scales: Array.from(scaleMap.entries())
        .map(([scale, shorthand]) => ({
          scale,
          shorthand,
        }))
        .sort((scale1, scale2) => scale1.scale.localeCompare(scale2.scale)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return diaries;
}
