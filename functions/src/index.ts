import { onSchedule } from "firebase-functions/v2/scheduler";
import { WOMClient, Metric } from "@wise-old-man/utils";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

const COMPETITION_ID = 122545;
const API_URL = "https://stability-backend-prototypes-production.up.railway.app";
const TRACKED_SKILLS: Metric[] = [Metric.SLAYER, Metric.MINING, Metric.WOODCUTTING, Metric.HUNTER];

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
  const response = await fetch(`${API_URL}/event/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    console.error(`Failed to submit event for ${event.rsn}: ${response.status}`);
  }
}

// Create a consistent document ID from player name and skill
function getDocId(playerName: string, skill: string): string {
  // Replace special characters to make a valid Firestore document ID
  return `${playerName.replace(/[^a-zA-Z0-9]/g, "_")}_${skill}`;
}

export const pollWomCompetition = onSchedule(
  {
    schedule: "every 30 minutes",
    timeZone: "America/New_York",
  },
  async () => {
    console.log("Polling WOM competition:", COMPETITION_ID);

    const collectionRef = db.collection(`wom_competition_${COMPETITION_ID}`);

    try {
      // Fetch competition details for each tracked skill using previewMetric
      for (const skill of TRACKED_SKILLS) {
        console.log(`Fetching ${skill} gains...`);
        const competition = await womClient.competitions.getCompetitionDetails(COMPETITION_ID, skill);

        for (const participation of competition.participations) {
          const playerName = participation.player.displayName;
          const currentXpGained = participation.progress.gained;

          // Get the previously stored XP for this player/skill
          const docId = getDocId(playerName, skill);
          const docRef = collectionRef.doc(docId);
          const doc = await docRef.get();

          const previousXpGained = doc.exists ? (doc.data()?.xpGained ?? 0) : 0;
          const delta = currentXpGained - previousXpGained;

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
            console.log(`Submitted ${skill} XP delta for ${playerName}: ${delta} (total: ${currentXpGained})`);
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
  }
);
