"use client";

import { useEffect } from "react";
import { TeamProgress } from "@/lib/types/v2";
import { useTileProgress } from "./TileProgressContext";

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
