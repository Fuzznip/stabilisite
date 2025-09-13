"use server";

import { revalidatePath } from "next/cache";

export async function revalidateBingo() {
  console.log("Revalidating bingo data...");
  revalidatePath(`${process.env.API_URL}events/board`);
  revalidatePath(`${process.env.API_URL}events/teams`);
}
