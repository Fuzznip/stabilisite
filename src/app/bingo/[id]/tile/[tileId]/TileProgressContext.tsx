"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { TeamProgress } from "@/lib/types/v2";

type TileProgressStore = {
  teamProgresses: TeamProgress[] | null;
  setTeamProgresses: (progresses: TeamProgress[]) => void;
};

const TileProgressContext = createContext<TileProgressStore | undefined>(
  undefined
);

export function TileProgressProvider({
  children,
  initialProgresses = null,
}: {
  children: React.ReactNode;
  initialProgresses?: TeamProgress[] | null;
}) {
  const [teamProgresses, setTeamProgressesState] =
    useState<TeamProgress[] | null>(initialProgresses);

  const setTeamProgresses = useCallback((progresses: TeamProgress[]) => {
    setTeamProgressesState(progresses);
  }, []);

  return (
    <TileProgressContext.Provider
      value={{
        teamProgresses,
        setTeamProgresses,
      }}
    >
      {children}
    </TileProgressContext.Provider>
  );
}

export function useTileProgress() {
  const context = useContext(TileProgressContext);
  if (!context) {
    throw new Error(
      "useTileProgress must be used within a TileProgressProvider"
    );
  }
  return context;
}
