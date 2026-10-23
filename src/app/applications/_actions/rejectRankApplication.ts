"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export default async function rejectRankApplication(
  id: string,
  reason: string
): Promise<void> {
  await apiFetch(`/applications/rank/${id}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verdict_reason: reason }),
  });
  revalidatePath("/applications");
}
