"use client";

import { Team } from "@/lib/types/bingo";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SelectedTeamContext {
  selectedTeam: Team | undefined;
  setSelectedTeam: React.Dispatch<React.SetStateAction<Team | undefined>>;
}

const SelectedTeamContext = createContext<SelectedTeamContext | undefined>(
  undefined
);

export function SelectedTeamProvider({ children }: { children: ReactNode }) {
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);

  return (
    <SelectedTeamContext.Provider value={{ selectedTeam, setSelectedTeam }}>
      {children}
    </SelectedTeamContext.Provider>
  );
}

export const useSelectedTeam = (): SelectedTeamContext => {
  const context = useContext(SelectedTeamContext);
  if (!context) {
    throw new Error(
      "useSelectedTeam must be used within a SelectedTeamProvider"
    );
  }
  return context;
};
