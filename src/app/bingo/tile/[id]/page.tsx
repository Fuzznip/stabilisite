import { TilePage } from "./TilePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center">
      <TilePage id={id} />
    </div>
  );
}
