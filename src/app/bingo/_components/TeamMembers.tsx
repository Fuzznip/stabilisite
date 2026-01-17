"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Team } from "@/lib/types/v2";

export default function TeamMembers({
  selectedTeam,
}: {
  selectedTeam?: Team;
}): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col items-start w-full",
        !selectedTeam && "invisible"
      )}
    >
      <span className="text-3xl text-foreground mb-2">Members</span>
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
