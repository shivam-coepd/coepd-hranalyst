import "server-only";

import crypto from "node:crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

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

  const { error } = await supabaseAdmin.storage
    .from("offer-letters")
    .upload(path, validated.buffer, {
      contentType: validated.mimeType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
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
  await supabaseAdmin.storage.from("offer-letters").remove([storagePath]);
}

export async function createOfferSignedUrl(storagePath: string) {
  const { data, error } = await supabaseAdmin.storage
    .from("offer-letters")
    .createSignedUrl(storagePath, 300);

  if (error || !data) {
    throw new Error("Unable to generate offer letter URL");
  }

  return data.signedUrl;
}
