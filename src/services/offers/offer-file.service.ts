import "server-only";

import crypto from "node:crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { s3Client } from "@/lib/supabase/s3";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_OFFER_SIZE = 10 * 1024 * 1024;

export async function validateOfferFile(file: File) {
  if (file.type !== "application/pdf") {
    throw new Error("Offer letter must be a PDF file");
  }

  if (file.size <= 0 || file.size > MAX_OFFER_SIZE) {
    throw new Error("Offer letter must be smaller than 10 MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (
    buffer.length < 5 ||
    buffer.subarray(0, 5).toString("ascii") !== "%PDF-"
  ) {
    throw new Error("Invalid PDF file");
  }

  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    buffer,
    hash,
    mimeType: "application/pdf",
    size: buffer.length,
  };
}

export async function uploadOfferFile({
  applicationId,
  file,
}: {
  applicationId: string;
  file: File;
}) {
  const validated = await validateOfferFile(file);

  const offerFileId = crypto.randomUUID();

  const path = `${applicationId}/${offerFileId}/offer.pdf`;

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: "offer-letters",
      Key: path,
      Body: validated.buffer,
      ContentType: validated.mimeType,
      CacheControl: "max-age=3600",
    }));
  } catch (error: any) {
    throw new Error(error.message || "Failed to upload offer letter");
  }

  return {
    bucketName: "offer-letters",
    storagePath: path,
    originalFileName: file.name,
    mimeType: validated.mimeType,
    fileSize: validated.size,
    fileHash: validated.hash,
  };
}

export async function deleteOfferFile(storagePath: string) {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: "offer-letters",
    Key: storagePath,
  }));
}

export async function createOfferSignedUrl(storagePath: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: "offer-letters",
      Key: storagePath,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 300 });
  } catch (error) {
    throw new Error("Unable to generate offer letter URL");
  }
}
