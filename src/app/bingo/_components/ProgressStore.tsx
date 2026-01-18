"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { TeamProgressResponse } from "@/lib/types/v2";

type ProgressStore = {
  progressMap: Record<string, TeamProgressResponse>;
  refetchTeamProgress: (teamId: string) => Promise<void>;
  refetchAllTeamsProgress: (teamIds: string[]) => Promise<void>;
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

  const refetchTeamProgress = useCallback(async (teamId: string) => {
    try {
      const response = await fetch(`/api/bingo/progress/${teamId}`);
      const newProgress: TeamProgressResponse = await response.json();
      setProgressMap((prev) => ({ ...prev, [teamId]: newProgress }));
    } catch (error) {
      console.error(`Failed to refetch progress for team ${teamId}:`, error);
    }
  }, []);

  const refetchAllTeamsProgress = useCallback(async (teamIds: string[]) => {
    try {
      const results = await Promise.all(
        teamIds.map(async (teamId) => {
          const response = await fetch(`/api/bingo/progress/${teamId}`);
          const progress: TeamProgressResponse = await response.json();
          return { teamId, progress };
        })
      );
      const newProgressMap = Object.fromEntries(
        results.map(({ teamId, progress }) => [teamId, progress])
      );
      setProgressMap(newProgressMap);
    } catch (error) {
      console.error("Failed to refetch all teams progress:", error);
    }
  }, []);

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
        refetchTeamProgress,
        refetchAllTeamsProgress,
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
