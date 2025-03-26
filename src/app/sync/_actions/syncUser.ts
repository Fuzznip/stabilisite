"use server";

import { auth } from "@/auth";
import { storeUser } from "@/lib/db/user";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export async function syncUser(username: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }
  try {
    await storeUser(session.user, username);
    redirect("/");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.debug("Unauthenticated user", err);
    return;
  }
}
