import { randomUUID } from "crypto";

import { extname } from "path";

import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { cvUploadSchema } from "@/lib/validators/cv-upload.schema";

export async function createCvUpload(input: unknown) {
  const user = await requireRole(["student"]);

  const parsed = cvUploadSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid CV file");
  }

  const { data: student } = await supabaseAdmin
    .from("student_profiles")
    .select(
      `
        id,
        verification_status
      `,
    )
    .eq("user_id", user.id)
    .single();

  if (!student) {
    throw new Error("Student profile not found");
  }

  if (student.verification_status !== "verified") {
    throw new Error("Only verified HRAnalyst students can upload CVs");
  }

  const values = parsed.data;

  const extension = extname(values.fileName).toLowerCase().replace(".", "");

  if (!["pdf", "docx"].includes(extension)) {
    throw new Error("Only PDF or DOCX CVs are allowed");
  }

  const cvId = randomUUID();

  const safeFileName = extension === "pdf" ? "resume.pdf" : "resume.docx";

  const storagePath = `${student.id}/${cvId}/${safeFileName}`;

  const { data: upload, error } = await supabaseAdmin.storage
    .from("student-cvs")
    .createSignedUploadUrl(storagePath);

  if (error || !upload) {
    throw new Error("Unable to prepare CV upload");
  }

  return {
    cvId,
    storagePath,

    uploadToken: upload.token,

    signedUrl: upload.signedUrl,
  };
}

export async function completeCvUpload(input: {
  cvId: string;
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
}) {
  const user = await requireRole(["student"]);

  const { data: student } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    throw new Error("Student not found");
  }

  const expectedPrefix = `${student.id}/${input.cvId}/`;

  if (!input.storagePath.startsWith(expectedPrefix)) {
    throw new Error("Invalid storage path");
  }

  const extension = input.storagePath.split(".").pop()?.toLowerCase();

  if (!extension || !["pdf", "docx"].includes(extension)) {
    throw new Error("Unsupported CV type");
  }

  const { data: existingPrimary } = await supabaseAdmin
    .from("student_cvs")
    .select("id")
    .eq("student_id", student.id)
    .eq("is_primary", true)
    .is("deleted_at", null)
    .maybeSingle();

  const isPrimary = !existingPrimary;

  const { data, error } = await supabaseAdmin
    .from("student_cvs")
    .insert({
      id: input.cvId,

      student_id: student.id,

      storage_path: input.storagePath,

      original_file_name: input.originalFileName,

      mime_type: input.mimeType,

      file_size: input.fileSize,

      file_extension: extension,

      is_primary: isPrimary,

      parsing_status: "pending",

      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: user.id,

    entity_type: "student_cv",

    entity_id: data.id,

    action: "CV_UPLOADED",

    new_values: {
      file_name: input.originalFileName,

      mime_type: input.mimeType,

      is_primary: isPrimary,
    },
  });

  return data;
}
