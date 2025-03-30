import { DiaryForm, User } from "../types";

export async function submitDiaryEntry(
  user: User | null,
  diaryForm: DiaryForm,
  fileUrl: string
): Promise<void> {
  const diaryRequest = {
    user_id: user?.discordId,
    date: diaryForm.date,
    members: diaryForm.teamMembers,
    activity: diaryForm.diary,
    scale: diaryForm.scale,
    time: diaryForm.time,
    proof_url: fileUrl,
  };
  console.log(diaryRequest);
  //   const response = await fetch(`${process.env.API_URL}/diary`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(diaryRequest),
  //   });

  //   return response.json();
  return;
}
