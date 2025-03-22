import NavBar from "./_components/NavBar";
import "../globals.css";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <main className="p-8">{children}</main>
    </>
  );
}
