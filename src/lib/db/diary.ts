import { DiaryForm, User } from "../types";

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
  return;
}
