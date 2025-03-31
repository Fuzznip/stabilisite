"use server";

import { DiaryForm } from "@/lib/types";
import { getAuthUser } from "./getAuthUser";
import { submitDiaryEntry } from "@/lib/db/diary";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function submitDiary(diaryForm: DiaryForm): Promise<void> {
  try {
    const user = await getAuthUser();
    if (
      user?.runescapeName &&
      !diaryForm.teamMembers?.includes(user?.runescapeName)
    )
      diaryForm.teamMembers?.unshift(user?.runescapeName);

    const fileName = diaryForm.proof?.name;
    const fileType = diaryForm.proof?.type;

    const key = `uploads/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

    await fetch(signedUrl, {
      method: "PUT",
      body: diaryForm.proof,
      headers: {
        "Content-Type": fileType!,
      },
    });

    await submitDiaryEntry(user, diaryForm, fileUrl);
    return;
  } catch (err) {
    console.debug("Unauthenticated user", err);
    return;
  }
}
