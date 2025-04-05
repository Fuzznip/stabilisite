"use server";

import { revalidatePath } from "next/cache";

export default async function acceptDiaryApplication(id: string): Promise<void> {
  await fetch(`${process.env.API_URL}/applications/diary/${id}/accept`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  revalidatePath("/applications/diary");
}
