import { Skeleton } from "@/components/ui/skeleton";

export default function Loading(): React.ReactElement {
  return (
    <div className="h-full m-auto w-1/2 flex flex-col mt-20">
      <Skeleton className="w-auto h-20 mx-auto" style={{ width: "300px" }} />
      <h1 className="text-3xl mx-auto mb-8 mt-2 text-center">
        Welcome to the Stability OSRS Clan website!
      </h1>
      <Skeleton className="h-12 w-48 mx-auto rounded-md" />
    </div>
  );
}
