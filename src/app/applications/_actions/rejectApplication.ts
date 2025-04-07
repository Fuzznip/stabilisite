"use server";

import { revalidatePath } from "next/cache";

export default async function rejectApplication(id: string): Promise<void> {
  await fetch(`${process.env.API_URL}/applications/${id}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ verdict_reason: "lol im not supporting this yet" }),
  });

  revalidatePath("/applications");
}
