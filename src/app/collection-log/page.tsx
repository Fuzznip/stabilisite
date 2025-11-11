import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function CollectionLogPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-8 mx-auto sm:mx-0">
      <h1 className="text-3xl font-bold">Clan Collection Log</h1>
      <div className="w-full bg-[#494134] border-[#12120F] outline-foreground outline border-8 aspect-[100/63] max-w-[1000px] flex flex-col">
        <div className="h-12 border-[#12120F] border-b-8 flex items-center justify-center relative w-full">
          <Button className="absolute left-1 text-white bg-[#494134] border-2 border-black text-xl shadow">
            <Search className="size-4" />
            Search
          </Button>
          <h2 className="text-2xl">Collection Log - 0 / 1568</h2>
        </div>
        <div className="flex flex-col w-full h-full">
          <div className="flex w-full gap-2 h-12 border-b-2 border-[#585140] align-bottom">
            tabs
          </div>
          <div className="flex w-full h-full border-b-2 border-[#585140]">
            <div className="h-full w-2/5 border-x-2 border-[#585140]">
              categories
            </div>
            <div className="h-full w-3/5 flex flex-col border-r-2 border-[#585140]">
              <div className="border-b-2 border-[#585140] h-1/4 w-full mb-0.5">
                stats
              </div>
              <div className="border-t-2 border-[#585140] h-3/4 w-full">
                items
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
