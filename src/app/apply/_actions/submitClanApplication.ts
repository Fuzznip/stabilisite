"use server";

import { createApplication } from "@/lib/db/application";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { Application } from "@/lib/types";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ActionResult } from "@/app/_actions/submitRank";

// The backend rejects duplicate/ineligible applications with plain-text reasons.
// Translate the ones a user can actually act on into readable copy.
const BACKEND_ERROR_MESSAGES: [RegExp, string][] = [
  [/already exists and is pending/i, "Your application has already been submitted"],
  [/already a member/i, "You're already a member of the clan"],
  [
    /rejected less than 30 days ago/i,
    "Your last application was rejected less than 30 days ago. Please wait before reapplying.",
  ],
];

function friendlyError(message: string): string | null {
  const match = BACKEND_ERROR_MESSAGES.find(([pattern]) => pattern.test(message));
  return match ? match[1] : null;
}

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
    const message = err instanceof Error ? err.message : "";
    return {
      success: false,
      error:
        friendlyError(message) ??
        "Something went wrong submitting your application. Please try again.",
    };
  }
}
