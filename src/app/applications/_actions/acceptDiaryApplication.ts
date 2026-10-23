"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export default async function acceptDiaryApplication(id: string): Promise<void> {
  await apiFetch(`/applications/diary/${id}/accept`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  revalidatePath("/applications");
}
