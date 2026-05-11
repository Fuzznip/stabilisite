import "leaflet/dist/leaflet.css";

export default function ConquestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="pb-12">{children}</div>;
}
