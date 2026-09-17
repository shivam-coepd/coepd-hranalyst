import { z } from "zod";

const score = z.coerce.number().min(0).max(100).optional();

export const verificationSchema = z
  .object({
    applicationId: z.string().uuid(),
    decision: z.enum(["verified", "rejected", "update_requested"]),
    verifiedMatchScore: score,
    verifiedAtsScore: score,
    mustHaveVerified: z.boolean(),
    cvVerified: z.boolean(),
    experienceVerified: z.boolean(),
    domainVerified: z.boolean(),
    notes: z.string().trim().max(5000).optional(),
    rejectionReason: z.string().trim().max(3000).optional(),
    updateRequest: z.string().trim().max(3000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "rejected" && !value.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rejectionReason"],
        message: "Rejection reason is required",
      });
    }
    if (value.decision === "update_requested" && !value.updateRequest) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["updateRequest"],
        message: "Update request is required",
      });
    }
    if (
      value.decision === "verified" &&
      !(
        value.mustHaveVerified &&
        value.cvVerified &&
        value.experienceVerified &&
        value.domainVerified
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["decision"],
        message: "Complete all verification checks before verifying",
      });
    }
  });

export type VerificationInput = z.infer<typeof verificationSchema>;
