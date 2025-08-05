import { Card, CardContent } from "@/components/ui/card";
import { useSelectedTeam } from "../_hooks/useSelectedTeam";
import { cn } from "@/lib/utils";

export default function TeamMembers(): React.ReactElement {
  const { selectedTeam } = useSelectedTeam();

  return (
    <div
      className={cn(
        "flex flex-col items-start w-full",
        !selectedTeam && "invisible"
      )}
    >
      <span className="text-3xl text-foreground lg:mt-7 mb-2">Members</span>
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-2 p-4 w-full px-12 lg:px-4">
          <div className="grid md:grid-cols-2 w-full gap-y-2 gap-x-24">
            {selectedTeam?.members.map((member) => (
              <span key={member} className="text-center text-lg w-full">
                {member}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
