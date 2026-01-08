import { FlickeringGrid } from "@/components/magicui/flickering-grid";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    </>
  );
}
