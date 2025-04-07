"use server";

import { createApplication } from "@/lib/db/application";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { Application } from "@/lib/types";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function submitClanApplication(
  application: Application
): Promise<void> {
  const user = await getAuthUser();
  if (!user?.id) {
    return;
  }
  try {
    await createApplication(user, application);
    return;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.debug(err);
    return;
  }
}
