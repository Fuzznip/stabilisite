"use server";

import { SplitForm } from "@/lib/types";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { uploadToS3 } from "./uploadToS3";
import { submitSplitEntry } from "@/lib/db/splits";
import { revalidatePath } from "next/cache";

export async function submitSplit(splitForm: SplitForm): Promise<void> {
  try {
    const user = await getAuthUser();
    const fileUrl = await uploadToS3(splitForm.proof);
    await submitSplitEntry(user, splitForm, fileUrl);
    revalidatePath("/splits");
    return;
  } catch (err) {
    throw err;
  }
}
