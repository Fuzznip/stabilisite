"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file?: File | null): Promise<string> {
  if (!file) return "";
  const fileName = file.name;
  const fileType = file.type;

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
    body: file,
    headers: {
      "Content-Type": fileType!,
    },
  });

  return fileUrl;
}
