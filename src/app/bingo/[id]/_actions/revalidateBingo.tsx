"use server";

import { revalidateTag } from "next/cache";

export async function revalidateBingo() {
  // Revalidate cached data for the bingo event (includes board and teams)
  revalidateTag("bingo-event");
}
