import { Suspense } from "react";
import {
  EventWithDetails,
  TeamProgressResponse,
  TeamWithMembers,
} from "@/lib/types/v2";
import { BingoClientWrapper } from "./_components/BingoClientWrapper";
import { ProgressHydrator } from "./_components/ProgressHydrator";
import { auth } from "@/auth";
import Loading from "./loading";

// Temporary allowed Discord IDs for bingo
const ALLOWED_BINGO_DISCORD_IDS = [
  "156543787882119168", // Tboodle
  "88087113626587136", // Funzip
  "298216403666993155", // SuperShane
  "646445353356361728", // CurrvyRabbit
  "144607395459366912", // Gl0bl
  "120691356925427712", // CrazyMuppets
  "104680242672566272", // IronIcedteee
  "334409893685624833", // SilentDDeath
  "347948542049910794", // SoccerTheNub
  "198296669253664768", // Xbrennyx
];

async function getActiveEvent(): Promise<EventWithDetails> {
  return fetch(`${process.env.API_URL}/v2/events/active`, {
    next: { tags: ["bingo-event"] },
  }).then((res) => res.json());
}

async function getTeamProgress(teamId: string): Promise<TeamProgressResponse> {
  return fetch(`${process.env.API_URL}/v2/teams/${teamId}/progress`, {
    next: { tags: ["bingo-progress", `team-progress-${teamId}`] },
  }).then((res) => res.json());
}

export default async function HomePage() {
  const session = await auth();
  const discordId = session?.user?.id;

  if (!discordId || !ALLOWED_BINGO_DISCORD_IDS.includes(discordId)) {
    return (
      <div className="w-fit mx-auto text-3xl text-stability">
        Come back soon!
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <EventContent />
    </Suspense>
  );
}

async function EventContent() {
  const event = await getActiveEvent();

  return (
    <BingoClientWrapper
      endDate={event.end_date}
      teams={event.teams}
      tiles={event.tiles}
    >
      <Suspense fallback={null}>
        <ProgressContent teams={event.teams} />
      </Suspense>
    </BingoClientWrapper>
  );
}

async function ProgressContent({ teams }: { teams: TeamWithMembers[] }) {
  const allTeamProgress = await Promise.all(
    teams.map(async (team) => {
      const progress = await getTeamProgress(team.id);
      return { teamId: team.id, progress };
    }),
  );

  const progressMap = Object.fromEntries(
    allTeamProgress.map(({ teamId, progress }) => [teamId, progress]),
  );

  return <ProgressHydrator progressMap={progressMap} />;
}
