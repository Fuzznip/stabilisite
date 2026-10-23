"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export default async function rejectDiaryApplication(
  id: string,
  reason: string
): Promise<void> {
  await apiFetch(`/applications/diary/${id}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verdict_reason: reason }),
  });
  revalidatePath("/applications");
}
