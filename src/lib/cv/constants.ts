export const MAX_CV_SIZE =
  10 * 1024 * 1024;

export const ALLOWED_CV_MIME_TYPES =
  new Set([
    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

export const ALLOWED_CV_EXTENSIONS =
  new Set([
    "pdf",
    "docx",
  ]);