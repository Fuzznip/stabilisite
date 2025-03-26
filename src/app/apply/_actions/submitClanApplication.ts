"use server";

import { auth } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export async function submitClanApplication(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }
  try {
    redirect("/");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.debug("Unauthenticated user", err);
    return;
  }
}
