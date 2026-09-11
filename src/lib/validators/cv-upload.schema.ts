import { z } from "zod";

export const cvUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(500),

  fileSize: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, "CV must be smaller than 10 MB"),

  mimeType: z.enum([
    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
});
