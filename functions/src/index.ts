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
    console.error(
      `Failed to submit event for ${event.rsn} [${response.status}]: ${body}`,
      JSON.stringify(event),
    );
  }
}

// Create a consistent document ID from player name and skill
function getDocId(playerName: string, skill: string): string {
  // Replace special characters to make a valid Firestore document ID
  return `${playerName.replace(/[^a-zA-Z0-9]/g, "_")}_${skill}`;
}

export const pollWomCompetition = onSchedule(
  {
    schedule: "every 2 hours",
    timeZone: "America/New_York",
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
      // Update all participants in the competition at once
      console.log("Updating all competition participants...");
      try {
        const updateResponse = await fetch(
          `https://api.wiseoldman.net/v2/competitions/${COMPETITION_ID}/update-all`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
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

      // Fetch competition details for each tracked skill using previewMetric
      for (const skill of TRACKED_SKILLS) {
        console.log(`Fetching ${skill} gains...`);
        const competition = await womClient.competitions.getCompetitionDetails(
          COMPETITION_ID,
          skill,
        );
        console.log(
          `Got ${competition.participations?.length ?? 0} participations for ${skill}`,
        );

        for (const participation of competition.participations) {
          const playerName = participation.player.displayName;
          const currentXpGained = participation.progress.gained;

          // Get the previously stored XP for this player/skill
          const docId = getDocId(playerName, skill);
          const docRef = collectionRef.doc(docId);
          const doc = await docRef.get();

          const previousXpGained = doc.exists ? (doc.data()?.xpGained ?? 0) : 0;
          const delta = currentXpGained - previousXpGained;

          console.log(playerName, skill, delta);

          if (delta > 0) {
            const event: EventSubmission = {
              rsn: playerName,
              id: `wom-${COMPETITION_ID}-${playerName}-${skill}-${Date.now()}`,
              trigger: skill,
              source: "wom_competition",
              quantity: delta,
              totalValue: currentXpGained,
              type: "SKILL",
            };

            await submitEvent(event);
            console.log(
              `Submitted ${skill} XP delta for ${playerName}: ${delta} (total: ${currentXpGained})`,
            );
          }

          // Update stored XP value
          await docRef.set({
            playerName,
            skill,
            xpGained: currentXpGained,
            updatedAt: new Date(),
          });
        }
      }

      console.log("Finished polling WOM competition");
    } catch (error) {
      console.error("Error polling WOM competition:", error);
      throw error;
    }
  },
);
