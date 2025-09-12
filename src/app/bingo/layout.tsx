import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { SelectedTeamProvider } from "./_hooks/useSelectedTeam";
import DropToaster from "./_components/DropToaster";
// import { BoardPayload, TeamsPayload } from "@/lib/types/bingo";
import { BingoProvider } from "./_components/BingoProvider";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const board = await fetch("/api/bingo/board")
  //   .then((res) => res.json())
  //   .then((data: BoardPayload) => data.board);
  // const teams = await fetch("/api/bingo/teams")
  //   .then((res) => res.json())
  //   .then((data: TeamsPayload) => data.teams);
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
      <BingoProvider board={[]} teams={[]}>
        <SelectedTeamProvider>
          <main>{children}</main>
          <DropToaster />
        </SelectedTeamProvider>
      </BingoProvider>
    </>
  );
}
