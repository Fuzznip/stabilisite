"use server";

import { auth } from "@/auth";
import { createApplication } from "@/lib/db/application";
import { Application } from "@/lib/types";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function submitClanApplication(
  application: Application
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }
  try {
    await createApplication(session.user, application);
    return;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.debug("Unauthenticated user", err);
    return;
  }
}
