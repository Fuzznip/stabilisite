"use client";

import { useEffect } from "react";
import { useProgress } from "./ProgressStore";
import { TeamProgressResponse } from "@/lib/types/v2";

export function ProgressHydrator({
  progressMap,
}: {
  progressMap: Record<string, TeamProgressResponse>;
}) {
  const { hydrateProgress } = useProgress();

  useEffect(() => {
    hydrateProgress(progressMap);
  }, [progressMap, hydrateProgress]);

  return null;
}
