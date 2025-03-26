"use server";

import { auth } from "@/auth";
import { storeUser } from "@/lib/db/user";
import { redirect } from "next/navigation";

export async function registerUser(username: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }
  try {
    await storeUser(session.user, username);
    redirect("/");
  } catch (err) {
    console.debug("Unauthenticated user", err);
    return;
  }
}
