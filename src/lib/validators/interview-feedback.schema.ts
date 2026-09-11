import { z } from "zod";

export const interviewFeedbackSchema = z
  .object({
    interviewId: z.string().uuid(),

    rating: z.coerce.number().min(1).max(5).optional(),

    decision: z.enum(["selected", "rejected", "on_hold"]),

    reasonCode: z.string().trim().max(100).optional(),

    comments: z.string().trim().max(5000).optional(),

    visibleToStudent: z.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "rejected" && !value.comments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comments"],
        message: "Comments are required when rejecting a candidate",
      });
    }
  });

export type InterviewFeedbackInput = z.infer<typeof interviewFeedbackSchema>;
