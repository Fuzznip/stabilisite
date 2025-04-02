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
  console.log(diaryRequest);
  const response = await fetch(`${process.env.API_URL}/applications/diary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(diaryRequest),
  });
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
    userId: diary.user_id,
    teamMembers: diary.party,
    shorthand: diary.diary_shorthand,
    time: diary.time_split,
    proof: diary.proof,
    targetDiaryId: diary.target_diary_id,
    date: new Date(diary.timestamp),
    status: diary.status,
  }));
}
