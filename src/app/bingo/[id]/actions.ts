"use server";

import { revalidateTag } from "next/cache";

export async function revalidateBingoProgress() {
  revalidateTag("bingo-progress");
}
