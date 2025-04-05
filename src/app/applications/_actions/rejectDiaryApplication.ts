"use server";

import { revalidatePath } from "next/cache";

export default async function rejectDiaryApplication(
  id: string
): Promise<void> {
  await fetch(`${process.env.API_URL}/applications/diary/${id}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason: "lol I dont support this yet" }),
  });
  revalidatePath("/applications/diary");
}
