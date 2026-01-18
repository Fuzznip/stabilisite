"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { TeamProgressResponse } from "@/lib/types/v2";

type ProgressStore = {
  progressMap: Record<string, TeamProgressResponse>;
  hydrateProgress: (progressMap: Record<string, TeamProgressResponse>) => void;
};

const ProgressContext = createContext<ProgressStore | undefined>(undefined);

export function ProgressProvider({
  children,
  initialProgressMap = {},
}: {
  children: React.ReactNode;
  initialProgressMap?: Record<string, TeamProgressResponse>;
}) {
  const [progressMap, setProgressMap] = useState(initialProgressMap);

  const hydrateProgress = useCallback(
    (newProgressMap: Record<string, TeamProgressResponse>) => {
      setProgressMap(newProgressMap);
    },
    []
  );

  return (
    <ProgressContext.Provider
      value={{
        progressMap,
        hydrateProgress,
      }}
    >
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
