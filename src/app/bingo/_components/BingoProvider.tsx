"use client";

import React, { createContext, useContext } from "react";
import { Team, Tile } from "@/lib/types/bingo";

type BingoContextType = {
  board: Tile[];
  teams: Team[];
};

const BingoContext = createContext<BingoContextType | undefined>({
  board: [],
  teams: [],
});

export const BingoProvider = ({
  board,
  teams,
  children,
}: {
  board: Tile[];
  teams: Team[];
  children: React.ReactNode;
}) => (
  <BingoContext.Provider value={{ board, teams }}>
    {children}
  </BingoContext.Provider>
);

export const useBingo = () => {
  const context = useContext(BingoContext);
  if (!context) {
    throw new Error("useBingo must be used within a BingoProvider");
  }
  return context;
};
