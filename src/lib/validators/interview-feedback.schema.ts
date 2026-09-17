import { z } from "zod";

const baseFeedback = z.object({
  interviewId: z.string().uuid(),
  rating: z.coerce.number().min(1).max(5).optional(),
  decision: z.enum(["selected", "rejected", "on_hold"]),
  reasonCode: z.string().trim().max(100).optional(),
  comments: z.string().trim().max(5000).optional(),
  visibleToStudent: z.boolean().default(true),
});

export const interviewFeedbackSchema = baseFeedback.superRefine(
  (value, ctx) => {
    if (value.decision === "rejected" && !value.comments?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comments"],
        message: "Rejection comments are required",
      });
    }
  },
);

export const reviseInterviewFeedbackSchema = baseFeedback
  .omit({ interviewId: true })
  .extend({
    feedbackId: z.string().uuid(),
    revisionReason: z.string().trim().min(3).max(2000),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "rejected" && !value.comments?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comments"],
        message: "Rejection comments are required",
      });
    }
  });

export type InterviewFeedbackInput = z.infer<typeof interviewFeedbackSchema>;
export type ReviseInterviewFeedbackInput = z.infer<
  typeof reviseInterviewFeedbackSchema
>;
