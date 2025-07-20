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
  const party =
    diaryForm.teamMembers?.length === diaryForm.scale
      ? diaryForm.teamMembers
      : [
          ...(diaryForm.teamMembers || []),
          ...Array(
            (diaryForm.scale || 1) - (diaryForm.teamMembers?.length || 0)
          ).fill(""),
        ];
  const diaryRequest: {
    user_id?: string;
    party?: string[];
    diary_shorthand: string;
    proof: string;
    time_split?: string;
  } = {
    user_id: user?.discordId,
    party: party,
    diary_shorthand: diaryForm.shorthand,
    proof: fileUrl,
  };

  if (diaryForm.time !== "00:00.0") {
    diaryRequest.time_split = `${diaryForm.time}0`;
  }

  const response = await fetch(`${process.env.API_URL}/applications/diary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(diaryRequest),
  });
  if (!response.ok) throw response.text();
  return;
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
    party: diary.party.filter((teamMember) => teamMember.length),
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
