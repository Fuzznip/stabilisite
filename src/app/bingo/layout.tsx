import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { SelectedTeamProvider } from "./_hooks/useSelectedTeam";
import DropToaster from "./_components/DropToaster";
import { Team } from "@/lib/types/bingo";
import { BingoProvider } from "./_components/BingoProvider";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const board = await fetch(`${process.env.API_URL}board`)
    .then((res) => res.json())
    .then(() => []);
  const teams = await fetch(`${process.env.API_URL}teams`)
    .then((res) => res.json())
    .then((data) => (data as Team[]) || [])
    .then((teams) => teams.sort((a, b) => (b.points ?? 0) - (a.points ?? 0)))
    .then((teams) => teams.sort((a, b) => b.name.localeCompare(a.name)));

  console.log(`${process.env.API_URL}/teams`, teams);
  return (
    <>
      <FlickeringGrid
        className="absolute inset-0 -z-10 size-full [mask-image:radial-gradient(1100px_circle_at_center,white,transparent)]"
        squareSize={4}
        gridGap={12}
        color="#A52D2A"
        maxOpacity={0.3}
        flickerChance={0.2}
      />
      <BingoProvider board={board} teams={teams}>
        <SelectedTeamProvider>
          <main>{children}</main>
          <DropToaster />
        </SelectedTeamProvider>
      </BingoProvider>
    </>
  );
}
