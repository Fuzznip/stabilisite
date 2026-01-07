import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import DropToaster from "./_components/DropToaster";
import { EventWithDetails } from "@/lib/types/v2";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const event: EventWithDetails = await fetch(
    `${process.env.API_URL}/v2/events/active`
  ).then((res) => res.json());

  // return <div className="w-fit mx-auto text-3xl my-24">Come back soon!</div>;
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
      <main>{children}</main>
      <DropToaster teams={event.teams} />
    </>
  );
}
