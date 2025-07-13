"use server";

import { revalidatePath } from "next/cache";

export default async function rejectRankApplication(id: string): Promise<void> {
  await fetch(`${process.env.API_URL}/applications/rank/${id}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ verdict_reason: "lol I dont support this yet" }),
  });
  revalidatePath("/applications/rank");
}
