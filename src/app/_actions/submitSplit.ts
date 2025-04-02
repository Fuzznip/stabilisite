"use server";

import { SplitForm } from "@/lib/types";
import { getAuthUser } from "./getAuthUser";
import { uploadToS3 } from "./uploadToS3";
import { submitSplitEntry } from "@/lib/db/splits";

export async function submitSplit(splitForm: SplitForm): Promise<void> {
  try {
    const user = await getAuthUser();
    const fileUrl = await uploadToS3(splitForm.proof);
    await submitSplitEntry(user, splitForm, fileUrl);
    return;
  } catch (err) {
    console.debug(err);
    return;
  }
}
