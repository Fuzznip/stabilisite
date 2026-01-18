"use client";

import { useEffect } from "react";
import { TeamProgressResponse } from "@/lib/types/v2";
import { useProgress } from "./ProgressStore";

type ProgressHydratorProps = {
  progressMap: Record<string, TeamProgressResponse>;
};

export function ProgressHydrator({ progressMap }: ProgressHydratorProps) {
  const { hydrateProgress } = useProgress();

  useEffect(() => {
    hydrateProgress(progressMap);
  }, [progressMap, hydrateProgress]);

  return null;
}
