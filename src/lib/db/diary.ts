import {
  DiaryApplication,
  DiaryApplicationResponse,
  DiaryForm,
  User,
} from "../types";

export async function submitDiaryEntry(
  user: User | null,
  diaryForm: DiaryForm,
  fileUrl: string
): Promise<void> {
  const diaryRequest = {
    user_id: user?.discordId,
    party: diaryForm.teamMembers,
    diary_shorthand: diaryForm.shorthand,
    time_split: diaryForm.time,
    proof: fileUrl,
  };
  const response = await fetch(`${process.env.API_URL}/applications/diary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(diaryRequest),
  });
  if (!response.ok) throw response.text();
  return response.json();
}

export async function getDiaryApplications(
  user?: User | null
): Promise<DiaryApplication[]> {
  const userParam = `?discord_id=${user?.discordId}`;

  const userDiaries = await fetch(
    `${process.env.API_URL}/applications/diary${user ? userParam : ""}`
  ).then((res) => res.json());

  return userDiaries.map((diary: DiaryApplicationResponse) => ({
    id: diary.id,
    userId: diary.user_id,
    date: new Date(diary.timestamp),
    name: diary.diary_name,
    shorthand: diary.diary_shorthand,
    party: diary.party,
    partyIds: diary.party_ids,
    proof: diary.proof,
    runescapeName: diary.runescape_name,
    status: diary.status,
    targetDiaryId: diary.target_diary_id,
    time: diary.time_split,
    verdictReason: diary.verdict_reason,
    verdictTimestamp: diary.verdict_timestamp,
  }));
}
