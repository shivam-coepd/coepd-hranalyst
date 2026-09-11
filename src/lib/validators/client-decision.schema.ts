import { z } from "zod";

export const clientDecisionSchema = z
  .object({
    submissionCandidateId: z.string().uuid(),

    decision: z.enum(["shortlisted", "rejected"]),

    reasonCode: z.string().trim().max(100).optional(),

    reason: z.string().trim().max(3000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "rejected" && !value.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["reason"],

        message: "Rejection reason is required",
      });
    }
  });

export type ClientDecisionInput = z.infer<typeof clientDecisionSchema>;
