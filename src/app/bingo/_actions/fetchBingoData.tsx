"use server";

import { Team, Tile } from "@/lib/types/bingo";

export default async function fetchBingoData(): Promise<{
  board: Tile[];
  teams: Team[];
}> {
  const board = await fetch(`${process.env.API_URL}/board`)
    .then((res) => res.json())
    .then(() => []);
  const teams = await fetch(`${process.env.API_URL}/teams`)
    .then((res) => res.json())
    .then((data) => (data as Team[]) || [])
    .then((teams) =>
      teams.sort((a, b) => {
        const diff = Number(b.points ?? 0) - Number(a.points ?? 0);
        if (diff === 0) {
          return a.name.localeCompare(b.name);
        }
        return diff;
      })
    );
  return { board, teams };
}
