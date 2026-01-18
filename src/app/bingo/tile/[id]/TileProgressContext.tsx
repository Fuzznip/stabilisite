"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { TeamProgress, TileProgressResponse } from "@/lib/types/v2";

type TileProgressContextType = {
  teamProgresses: TeamProgress[] | null;
  setTeamProgresses: (progresses: TeamProgress[]) => void;
  refetchProgress: (tileId: string) => Promise<void>;
};

const TileProgressContext = createContext<TileProgressContextType | null>(null);

export function TileProgressProvider({
  children,
  initialTeamProgresses,
}: {
  children: React.ReactNode;
  initialTeamProgresses?: TeamProgress[];
}) {
  const [teamProgresses, setTeamProgressesState] = useState<TeamProgress[] | null>(
    initialTeamProgresses ?? null
  );

  const setTeamProgresses = useCallback((progresses: TeamProgress[]) => {
    setTeamProgressesState(progresses);
  }, []);

  const refetchProgress = useCallback(async (tileId: string) => {
    const response = await fetch(`/api/bingo/tile/${tileId}/progress`);
    const data: TileProgressResponse = await response.json();
    setTeamProgressesState(data.teams);
  }, []);

  return (
    <TileProgressContext.Provider
      value={{ teamProgresses, setTeamProgresses, refetchProgress }}
    >
      {children}
    </TileProgressContext.Provider>
  );
}

export function useTileProgress() {
  const context = useContext(TileProgressContext);
  if (!context) {
    throw new Error("useTileProgress must be used within TileProgressProvider");
  }
  return context;
}
