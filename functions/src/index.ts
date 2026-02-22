import { onSchedule } from "firebase-functions/v2/scheduler";
import { WOMClient, Metric } from "@wise-old-man/utils";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

const COMPETITION_ID = 122545;
const COMPETITION_VERIFICATION_CODE =
  process.env.WOM_COMPETITION_VERIFICATION_CODE || "";
const API_URL =
  "https://stability-backend-prototypes-production.up.railway.app";
const TRACKED_SKILLS: Metric[] = [
  Metric.SLAYER,
  Metric.MINING,
  Metric.WOODCUTTING,
  Metric.HUNTER,
];

const womClient = new WOMClient();

interface EventSubmission {
  rsn: string;
  id: string;
  trigger: string;
  source: string;
  quantity: number;
  totalValue: number;
  type: string;
}

async function submitEvent(event: EventSubmission): Promise<void> {
  const response = await fetch(`${API_URL}/events/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[${response.status}] ${body}`);
  }
}

// Create a consistent document ID from player name and skill
function getDocId(playerName: string, skill: string): string {
  return `${playerName.replace(/[^a-zA-Z0-9]/g, "_")}_${skill}`;
}

export const pollWomCompetition = onSchedule(
  {
    schedule: "every 30 minutes",
    timeZone: "America/New_York",
    timeoutSeconds: 3600,
  },
  async () => {
    // Don't run until event starts: 3pm ET on 02/20/2026
    const eventStart = new Date("2026-02-20T15:00:00-05:00");
    if (new Date() < eventStart) {
      console.log("Event hasn't started yet, skipping.");
      return;
    }

    console.log("Polling WOM competition:", COMPETITION_ID);

    const collectionRef = db.collection(`wom_competition_${COMPETITION_ID}`);

    try {
      // Queue participant updates on WoM — async on their side, data will be fresher next run
      console.log("Updating all competition participants...");
      try {
        const updateResponse = await fetch(
          `https://api.wiseoldman.net/v2/competitions/${COMPETITION_ID}/update-all`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              verificationCode: COMPETITION_VERIFICATION_CODE,
            }),
          },
        );
        if (updateResponse.ok) {
          console.log("Successfully queued participant updates");
        } else {
          console.warn(
            "Failed to update participants:",
            updateResponse.status,
            await updateResponse.text(),
          );
        }
      } catch (err) {
        console.warn("Failed to update all participants:", err);
      }

      // Fetch all skills in parallel
      console.log("Fetching competition details for all skills...");
      const skillResults = await Promise.all(
        TRACKED_SKILLS.map(async (skill) => {
          const competition =
            await womClient.competitions.getCompetitionDetails(
              COMPETITION_ID,
              skill,
            );
          console.log(
            `Got ${competition.participations?.length ?? 0} participations for ${skill}`,
          );
          return { skill, participations: competition.participations };
        }),
      );

      // Process each skill in parallel
      await Promise.all(
        skillResults.map(async ({ skill, participations }) => {
          if (!participations.length) return;

          // Batch-read all Firestore docs for this skill in one round trip
          const docRefs = participations.map((p) =>
            collectionRef.doc(getDocId(p.player.displayName, skill)),
          );
          const snapshots = await db.getAll(...docRefs);
          const snapshotMap = new Map(snapshots.map((snap) => [snap.id, snap]));

          interface PendingEvent {
            event: EventSubmission;
            ref: FirebaseFirestore.DocumentReference;
            data: object;
          }

          const pending: PendingEvent[] = [];

          for (const participation of participations) {
            const playerName = participation.player.displayName;
            const currentXpGained = participation.progress.gained;
            const docId = getDocId(playerName, skill);
            const snap = snapshotMap.get(docId);

            const previousXpGained = snap?.exists
              ? (snap.data()?.xpGained ?? 0)
              : 0;
            const delta = currentXpGained - previousXpGained;

            if (delta <= 0) continue;

            console.log(playerName, skill, delta);

            pending.push({
              event: {
                rsn: playerName,
                id: `wom-${COMPETITION_ID}-${playerName}-${skill}-${Date.now()}`,
                trigger: skill,
                source: "wom_competition",
                quantity: delta,
                totalValue: currentXpGained,
                type: "SKILL",
              },
              ref: collectionRef.doc(docId),
              data: { playerName, skill, xpGained: currentXpGained, updatedAt: new Date() },
            });
          }

          // Submit in chunks of 3; only write Firestore for successful submissions
          const CONCURRENCY = 3;
          const successfulWrites: Array<{
            ref: FirebaseFirestore.DocumentReference;
            data: object;
          }> = [];

          for (let i = 0; i < pending.length; i += CONCURRENCY) {
            const chunk = pending.slice(i, i + CONCURRENCY);
            const results = await Promise.allSettled(
              chunk.map((p) => submitEvent(p.event)),
            );
            results.forEach((result, j) => {
              if (result.status === "fulfilled") {
                successfulWrites.push({ ref: chunk[j].ref, data: chunk[j].data });
              } else {
                console.error(
                  `Failed to submit event for ${chunk[j].event.rsn} (${skill}):`,
                  result.reason,
                );
              }
            });
          }

          // Batch-write Firestore only for successful submissions
          const BATCH_SIZE = 500;
          for (let i = 0; i < successfulWrites.length; i += BATCH_SIZE) {
            const batch = db.batch();
            successfulWrites
              .slice(i, i + BATCH_SIZE)
              .forEach(({ ref, data }) => batch.set(ref, data));
            await batch.commit();
          }

          console.log(
            `Processed ${participations.length} players for ${skill}: ${successfulWrites.length}/${pending.length} events submitted`,
          );
        }),
      );

      console.log("Finished polling WOM competition");
    } catch (error) {
      console.error("Error polling WOM competition:", error);
      throw error;
    }
  },
);
