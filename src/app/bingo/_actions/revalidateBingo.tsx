"use server";

import { revalidatePath } from "next/cache";

export async function revalidateBingo() {
  revalidatePath(`${process.env.API_URL}events/board`);
  revalidatePath(`${process.env.API_URL}events/teams`);
}
