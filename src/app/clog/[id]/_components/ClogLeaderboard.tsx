import type { ClogProgress } from "@/lib/types/v2";

export function ClogLeaderboard({
  progress,
  totalPoints,
}: {
  progress: ClogProgress;
  totalPoints: number;
}): React.ReactElement {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted-foreground">
          <tr>
            <th className="py-2 text-left font-medium">#</th>
            <th className="py-2 text-left font-medium">Team</th>
            <th className="py-2 text-right font-medium">Slots</th>
            <th className="py-2 text-right font-medium">Points</th>
          </tr>
        </thead>
        <tbody>
          {progress.standings.map((team) => (
            <tr key={team.team_id} className="border-t border-border">
              <td className="py-2">{team.rank}</td>
              <td className="py-2">
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: team.color ?? "var(--muted)" }}
                  />
                  {team.name}
                </span>
              </td>
              <td className="py-2 text-right tabular-nums">
                {team.slots_completed}
              </td>
              <td className="py-2 text-right tabular-nums">
                {team.points}
                <span className="text-muted-foreground"> / {totalPoints}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
