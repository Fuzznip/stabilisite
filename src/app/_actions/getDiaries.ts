"use server";

import { ShortDiary } from "@/lib/types";

let cachedDiaries: ShortDiary[] | null = null;

export async function getDiaries(): Promise<ShortDiary[]> {
  return [
    {
      name: "Fight Caves",
      scales: [{ scale: "1", shorthand: "jad" }],
    },
    {
      name: "Inferno",
      scales: [{ scale: "1", shorthand: "inferno" }],
    },
    {
      name: "Fortis Colosseum",
      scales: [{ scale: "1", shorthand: "colo" }],
    },
    {
      name: "Theatre of Blood",
      scales: [
        { scale: "5", shorthand: "tob5" },
        { scale: "2", shorthand: "tob2" },
        { scale: "3", shorthand: "tob3" },
        { scale: "4", shorthand: "tob4" },
      ],
    },
    {
      name: "Challenge Mode Chambers of Xeric",
      scales: [
        { scale: "3", shorthand: "cm3" },
        { scale: "1", shorthand: "cm1" },
        { scale: "5", shorthand: "cm5" },
      ],
    },
    {
      name: "Theatre of Blood: Hard Mode",
      scales: [
        { scale: "4", shorthand: "hmt4" },
        { scale: "5", shorthand: "hmt5" },
      ],
    },
    {
      name: "Tombs of Amascut: Expert Mode",
      scales: [
        { scale: "1", shorthand: "toa1" },
        { scale: "8", shorthand: "toa8" },
      ],
    },
  ];
  if (cachedDiaries) return cachedDiaries;
  console.time("fetch");
  const diaryResponse = await fetch(`${process.env.API_URL}/diary/categories`, {
    cache: "force-cache",
  }).then((res) => res.json());
  console.timeEnd("fetch");
  console.time("grouping");
  const grouped = new Map<string, Map<string, string>>();

  for (const { diary_name, shorthand, scale } of diaryResponse) {
    if (!scale) continue;

    if (!grouped.has(diary_name)) {
      grouped.set(diary_name, new Map());
    }

    grouped.get(diary_name)!.set(scale, shorthand);
  }
  console.timeEnd("grouping");

  console.time("mapping + sorting");
  cachedDiaries = Array.from(grouped.entries())
    .map(([diaryName, scaleMap]) => ({
      name: diaryName,
      scales: Array.from(scaleMap.entries()).map(([scale, shorthand]) => ({
        scale,
        shorthand,
      })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  console.timeEnd("mapping + sorting");

  return cachedDiaries;
}
