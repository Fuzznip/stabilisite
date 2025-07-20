"use server";

import { revalidatePath } from "next/cache";

export default async function acceptRankApplication(id: string): Promise<void> {
  await fetch(`${process.env.API_URL}/applications/rank/${id}/accept`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  revalidatePath("/applications/rank");
}
