import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(R2, command, { expiresIn: 3600 });
}

export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(R2, command, { expiresIn: 3600 });
}

export async function uploadToR2(key: string, body: Buffer | Uint8Array, contentType: string): Promise<void> {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  await R2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export function generatePhotoKey(userId: string, filename: string): string {
  const ext = filename.split(".").pop();
  const timestamp = Date.now();
  return `photos/${userId}/${timestamp}.${ext}`;
}

export function generateIllustrationKey(bookId: string, pageNumber: number): string {
  return `books/${bookId}/illustrations/page-${pageNumber.toString().padStart(2, "0")}.png`;
}

export function generateCharacterRefKey(bookId: string): string {
  return `books/${bookId}/character-ref.png`;
}

export function generatePdfKey(bookId: string, type: "print" | "preview"): string {
  return `books/${bookId}/${type === "print" ? "book-print.pdf" : "book-preview.pdf"}`;
}
