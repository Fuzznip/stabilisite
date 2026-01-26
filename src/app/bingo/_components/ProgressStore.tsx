"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { TeamProgressResponse } from "@/lib/types/v2";

type ProgressStore = {
  progressMap: Record<string, TeamProgressResponse>;
  isLoading: boolean;
  hydrateProgress: (progressMap: Record<string, TeamProgressResponse>) => void;
};

const ProgressContext = createContext<ProgressStore | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progressMap, setProgressMap] = useState<
    Record<string, TeamProgressResponse>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const hydrateProgress = useCallback(
    (newProgressMap: Record<string, TeamProgressResponse>) => {
      setProgressMap(newProgressMap);
      setIsLoading(false);
    },
    []
  );

  return (
    <ProgressContext.Provider value={{ progressMap, isLoading, hydrateProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
