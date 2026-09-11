import { z } from "zod";

export const scheduleInterviewSchema = z
  .object({
    submissionCandidateId: z.string().uuid(),

    roundNumber: z.coerce.number().int().min(1).max(20),

    roundName: z.string().trim().min(2).max(150),

    interviewType: z.enum([
      "client",
      "technical",
      "managerial",
      "hr",
      "final",
      "other",
    ]),

    scheduledAt: z.string().datetime(),

    durationMinutes: z.coerce.number().int().min(15).max(480),

    timezone: z.string().trim().min(2).max(100),

    mode: z.enum(["online", "offline"]),

    meetingProvider: z.string().trim().max(50).optional(),

    meetingLink: z.string().url().optional(),

    location: z.string().trim().max(500).optional(),

    instructions: z.string().trim().max(5000).optional(),
  })
  .superRefine((value, ctx) => {
    const scheduled = new Date(value.scheduledAt);

    if (scheduled.getTime() <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledAt"],
        message: "Interview must be scheduled in the future",
      });
    }

    if (value.mode === "online" && !value.meetingLink) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["meetingLink"],
        message: "Meeting link is required for an online interview",
      });
    }

    if (value.mode === "offline" && !value.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location"],
        message: "Location is required for an offline interview",
      });
    }
  });

export const rescheduleInterviewSchema = z.object({
  interviewId: z.string().uuid(),

  scheduledAt: z.string().datetime(),

  timezone: z.string().trim().min(2).max(100),

  mode: z.enum(["online", "offline"]),

  meetingProvider: z.string().trim().max(50).optional(),

  meetingLink: z.string().url().optional(),

  location: z.string().trim().max(500).optional(),

  reason: z.string().trim().min(3).max(3000),
});

export const cancelInterviewSchema = z.object({
  interviewId: z.string().uuid(),

  reason: z.string().trim().min(3).max(3000),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;

export type RescheduleInterviewInput = z.infer<
  typeof rescheduleInterviewSchema
>;

export type CancelInterviewInput = z.infer<typeof cancelInterviewSchema>;
