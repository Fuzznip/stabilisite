"use client";

import Image from "next/image";
import { ArrowLeft, Award, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * A team as the leaderboard needs it, independent of any one event type.
 *
 * Every event shapes its teams differently — bingo carries members, conquest
 * carries territories, the collection log race carries completed slots — so the
 * two places they genuinely diverge are the only two a consumer supplies:
 * `subtitle` for the row, and `renderDetail` for the pane behind it.
 */
export type LeaderboardTeam = {
  id: string;
  name: string;
  points: number;
  color?: string | null;
  imageUrl?: string | null;
  /** The small line under the team name — "12 members", "41 / 406 slots". */
  subtitle?: React.ReactNode;
};

type EventLeaderboardProps = {
  teams: LeaderboardTeam[];
  /** Whose detail pane is open. `null` shows the ranked list. */
  selectedTeamId: string | null;
  /**
   * Which row reads as active, when that differs from whose detail is open.
   * An event where picking a team also filters something else on the page wants
   * the row to stay marked after the pane is closed; defaults to
   * `selectedTeamId`, which is what an event without that split wants.
   */
  activeTeamId?: string | null;
  onSelectTeam: (teamId: string | null) => void;
  title?: string;
  /** Shown under the title when nothing is selected. */
  hint?: string;
  unit?: string;
  /** The detail pane for the selected team. Without it, rows stay selectable
   *  but never open a pane — which is what an event wants when selecting a team
   *  only filters something else on the page. */
  renderDetail?: (team: LeaderboardTeam, rank: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
  /**
   * Tailwind height class for the card body. Fixed rather than fluid on
   * purpose: the detail pane can hold a twenty-player roster, and a card that
   * grew to fit it would shove the rest of the page down every time you opened
   * a team. Both views scroll inside this instead.
   */
  bodyHeight?: string;
  /**
   * Draw a points-relative-to-leader bar on each row. Off by default: the bar
   * is what forces the card wide, so a leaderboard living in a sidebar wants
   * compact rows. An event that gives it a full-width column can turn it on.
   */
  showProgressBars?: boolean;
};

const RANK_STYLES: Record<
  number,
  { icon: typeof Trophy; className: string; label: string }
> = {
  1: {
    icon: Trophy,
    className:
      "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    label: "1st",
  },
  2: {
    icon: Award,
    className:
      "bg-slate-400/20 text-slate-600 dark:text-slate-300 border-slate-400/30",
    label: "2nd",
  },
  3: {
    icon: Award,
    className:
      "bg-amber-600/20 text-amber-700 dark:text-amber-500 border-amber-600/30",
    label: "3rd",
  },
};

function RankBadge({ rank }: { rank: number }): React.ReactElement {
  const style = RANK_STYLES[rank];
  if (!style) {
    return (
      <span className="w-7 shrink-0 text-center text-base font-bold tabular-nums text-muted-foreground">
        {rank}
      </span>
    );
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "size-7 shrink-0 justify-center border-2 p-0 text-base font-bold",
        style.className,
      )}
      aria-label={style.label}
    >
      {rank}
    </Badge>
  );
}

function TeamAvatar({
  team,
  size,
}: {
  team: LeaderboardTeam;
  size: number;
}): React.ReactElement {
  if (team.imageUrl) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded border border-border"
        style={{ height: size, width: size }}
      >
        <Image
          src={team.imageUrl}
          alt=""
          fill
          sizes={`${size}px`}
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }
  // No image: a colour chip still tells the teams apart, and keeps the row's
  // left edge aligned with teams that do have one.
  return (
    <div
      aria-hidden
      className="shrink-0 rounded border border-border"
      style={{
        height: size,
        width: size,
        background: team.color ?? "var(--muted)",
      }}
    />
  );
}

export function EventLeaderboard({
  teams,
  selectedTeamId,
  activeTeamId,
  onSelectTeam,
  title = "Leaderboard",
  hint = "Click a team for details",
  unit = "pts",
  renderDetail,
  emptyState,
  className,
  bodyHeight = "h-[30rem]",
  showProgressBars = false,
}: EventLeaderboardProps): React.ReactElement {
  // Sorted here rather than trusting the caller, so every event ranks the same
  // way. Ties break on name to keep the order stable between renders.
  const sorted = [...teams].sort(
    (a, b) => b.points - a.points || a.name.localeCompare(b.name),
  );
  // The bar is relative to the leader, not to a theoretical maximum: what a
  // reader wants from a standings list is the gap between teams.
  const leaderPoints = Math.max(...sorted.map((t) => t.points), 1);

  const highlightId = activeTeamId ?? selectedTeamId;
  const selectedIndex = selectedTeamId
    ? sorted.findIndex((t) => t.id === selectedTeamId)
    : -1;
  const selected = selectedIndex >= 0 ? sorted[selectedIndex] : null;
  const showDetail = Boolean(selected && renderDetail);

  return (
    <div className={cn("flex w-full flex-col", className)}>
      {/* No heading above the card: the card's top edge is the column's top
          edge, so it lines up with whatever it sits beside. The title moves
          inside, the way conquest's scoreboard does it. */}
      <Card className={cn("flex flex-col overflow-hidden py-0", bodyHeight)}>
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          {showDetail && selected ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 border-b p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-4 flex items-center gap-2"
                  onClick={() => onSelectTeam(null)}
                >
                  <ArrowLeft className="size-4" />
                  Back to leaderboard
                </Button>

                <div className="flex items-start gap-4">
                  <TeamAvatar team={selected} size={72} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="truncate text-2xl font-bold">
                        {selected.name}
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tabular-nums">
                        {selected.points}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {renderDetail?.(selected, selectedIndex + 1)}
              </div>
            </div>
          ) : sorted.length ? (
            <>
              <div className="shrink-0 border-b px-3 py-2.5">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                {hint && (
                  <p className="truncate text-sm text-muted-foreground">
                    {hint}
                  </p>
                )}
              </div>
              <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
                {sorted.map((team, index) => {
                  const rank = index + 1;
                  const isSelected = team.id === highlightId;
                  const width = showProgressBars
                    ? Math.max(
                        2,
                        Math.round((team.points / leaderPoints) * 100),
                      )
                    : 0;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => onSelectTeam(team.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "group flex w-full cursor-pointer items-center gap-2.5 px-3 py-3 text-left transition-colors",
                        "hover:bg-muted/50 active:bg-muted",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                        isSelected && "bg-muted/40",
                      )}
                    >
                      <RankBadge rank={rank} />
                      <TeamAvatar team={team} size={56} />

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-2xl font-semibold leading-tight">
                          {team.name}
                        </div>
                        {team.subtitle && (
                          <div className="truncate text-sm text-muted-foreground">
                            {team.subtitle}
                          </div>
                        )}
                        {showProgressBars && (
                          <div
                            className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10"
                            aria-hidden
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${width}%`,
                                background: team.color ?? "var(--foreground)",
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-2xl font-bold tabular-nums">
                          {team.points}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {unit}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            (emptyState ?? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
                <Trophy className="mb-4 size-12 text-muted-foreground/40" />
                <p className="text-lg text-muted-foreground">No teams yet</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
