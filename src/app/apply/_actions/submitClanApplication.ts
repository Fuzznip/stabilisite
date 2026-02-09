"use server";

import { createApplication } from "@/lib/db/application";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { Application } from "@/lib/types";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ActionResult } from "@/app/_actions/submitRank";

export async function submitClanApplication(
  application: Application
): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user?.id) {
    return { success: false, error: "You must be logged in to apply" };
  }
  try {
    await createApplication(user, application);
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("[submitClanApplication] Failed:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}
