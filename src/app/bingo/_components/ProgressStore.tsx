"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { TeamProgressResponse } from "@/lib/types/v2";

type ProgressStore = {
  progressMap: Record<string, TeamProgressResponse>;
  refetchTeamProgress: (teamId: string) => Promise<void>;
};

const ProgressContext = createContext<ProgressStore | undefined>(undefined);

export function ProgressProvider({
  children,
  initialProgressMap,
}: {
  children: React.ReactNode;
  initialProgressMap: Record<string, TeamProgressResponse>;
}) {
  const [progressMap, setProgressMap] = useState(initialProgressMap);

  const refetchTeamProgress = useCallback(async (teamId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v2/teams/${teamId}/progress`
      );
      const newProgress: TeamProgressResponse = await response.json();
      setProgressMap((prev) => ({ ...prev, [teamId]: newProgress }));
    } catch (error) {
      console.error(`Failed to refetch progress for team ${teamId}:`, error);
    }
  }, []);

  return (
    <ProgressContext.Provider value={{ progressMap, refetchTeamProgress }}>
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
