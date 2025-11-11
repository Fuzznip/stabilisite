// import { FlickeringGrid } from "@/components/magicui/flickering-grid";
// import { SelectedTeamProvider } from "./_hooks/useSelectedTeam";
// import DropToaster from "./_components/DropToaster";
// import { BingoProvider } from "./_components/BingoProvider";
// import fetchBingoData from "./_actions/fetchBingoData";

// export default async function Layout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
export default async function Layout() {
  // const { board, teams } = await fetchBingoData();
  return <div className="w-fit mx-auto text-3xl my-24">Come back soon!</div>;
  // return (
  //   <>
  //     <FlickeringGrid
  //       className="absolute inset-0 -z-10 size-full [mask-image:radial-gradient(1100px_circle_at_center,white,transparent)]"
  //       squareSize={4}
  //       gridGap={12}
  //       color="#A52D2A"
  //       maxOpacity={0.3}
  //       flickerChance={0.2}
  //     />
  //     <BingoProvider board={board} teams={teams}>
  //       <SelectedTeamProvider>
  //         <main>{children}</main>
  //         <DropToaster />
  //       </SelectedTeamProvider>
  //     </BingoProvider>
  //   </>
  // );
}
