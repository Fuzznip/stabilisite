import { Team, Tile } from "@/lib/types/bingo";

export default async function fetchBingoData(): Promise<{
  board: Tile[];
  teams: Team[];
}> {
  const board = await fetch(`${process.env.API_URL}board`)
    .then((res) => res.json())
    .then(() => []);
  const teams = await fetch(`${process.env.API_URL}teams`)
    .then((res) => res.json())
    .then((data) => (data as Team[]) || [])
    .then((teams) => teams.sort((a, b) => (b.points ?? 0) - (a.points ?? 0)))
    .then((teams) => teams.sort((a, b) => b.name.localeCompare(a.name)));
  return { board, teams };
}
