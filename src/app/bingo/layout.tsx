import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { SelectedTeamProvider } from "./_hooks/useSelectedTeam";
import DropToaster from "./_components/DropToaster";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <SelectedTeamProvider>
        <main>{children}</main>
        <DropToaster />
      </SelectedTeamProvider>
    </>
  );
}
