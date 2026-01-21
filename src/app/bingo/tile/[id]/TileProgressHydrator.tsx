"use client";

import { useEffect } from "react";
import { useTileProgress } from "./TileProgressContext";
import { TeamProgress } from "@/lib/types/v2";

export function TileProgressHydrator({
  teamProgresses,
}: {
  teamProgresses: TeamProgress[];
}) {
  const { setTeamProgresses } = useTileProgress();

  useEffect(() => {
    setTeamProgresses(teamProgresses);
  }, [teamProgresses, setTeamProgresses]);

  return null;
}
