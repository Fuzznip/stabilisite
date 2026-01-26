"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { TeamProgressResponse } from "@/lib/types/v2";

type ProgressStore = {
  progressMap: Record<string, TeamProgressResponse>;
  loadingTeams: Set<string>;
  hydrateProgress: (progressMap: Record<string, TeamProgressResponse>) => void;
  prefetchTeams: (teamIds: string[]) => void;
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
  const [loadingTeams, setLoadingTeams] = useState<Set<string>>(new Set());
  const fetchingRef = useRef<Set<string>>(new Set());

  const hydrateProgress = useCallback(
    (newProgressMap: Record<string, TeamProgressResponse>) => {
      setProgressMap(newProgressMap);
    },
    [],
  );

  const prefetchTeams = useCallback((teamIds: string[]) => {
    teamIds.forEach((teamId) => {
      // Skip if already have data or currently fetching
      if (fetchingRef.current.has(teamId)) {
        return;
      }

      fetchingRef.current.add(teamId);
      setLoadingTeams((prev) => new Set(prev).add(teamId));

      fetch(`/api/bingo/progress/${teamId}`)
        .then((res) => res.json())
        .then((data: TeamProgressResponse) => {
          setProgressMap((prev) => {
            // Don't override if we already have data (from server)
            if (prev[teamId]) return prev;
            return { ...prev, [teamId]: data };
          });
        })
        .catch((err) => {
          console.error(`Failed to prefetch team ${teamId}:`, err);
        })
        .finally(() => {
          fetchingRef.current.delete(teamId);
          setLoadingTeams((prev) => {
            const next = new Set(prev);
            next.delete(teamId);
            return next;
          });
        });
    });
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progressMap,
        loadingTeams,
        hydrateProgress,
        prefetchTeams,
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
