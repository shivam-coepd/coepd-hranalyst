import { z } from "zod";

export const registerOfferSchema = z.object({
  applicationId: z.string().uuid(),

  feedbackId: z.string().uuid(),

  designation: z.string().trim().min(2).max(255),

  department: z.string().trim().max(255).optional(),

  employmentType: z.string().trim().max(100).optional(),

  joiningLocation: z.string().trim().max(255).optional(),

  annualCtc: z.coerce.number().nonnegative().optional(),

  currency: z.string().trim().min(3).max(10).default("INR"),

  joiningDate: z.string().date().optional(),

  offerDate: z.string().date().optional(),

  offerValidUntil: z.string().date().optional(),

  probationPeriodMonths: z.coerce.number().int().min(0).max(36).optional(),

  noticeBuyoutAvailable: z.boolean().optional(),

  notes: z.string().trim().max(5000).optional(),
});

export const studentOfferDecisionSchema = z
  .object({
    offerId: z.string().uuid(),

    decision: z.enum(["accepted", "declined"]),

    reason: z.string().trim().max(3000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "declined" && !value.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "Reason is required when declining an offer",
      });
    }
  });

export type RegisterOfferInput = z.infer<typeof registerOfferSchema>;

export type StudentOfferDecisionInput = z.infer<
  typeof studentOfferDecisionSchema
>;
