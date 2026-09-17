import { z } from "zod";
export const createSubmissionSchema = z.object({
  jobId: z.string().uuid(),
  applicationIds: z.array(z.string().uuid()).min(1).max(100),
  notes: z.string().trim().max(5000).optional().default(""),
});
