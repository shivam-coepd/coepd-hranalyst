import { z } from "zod";

const mockScheduleFields = {
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240).default(60),
  mode: z.enum(["online", "offline"]),
  evaluatorUserId: z.string().uuid(),
  meetingLink: z.string().url().optional(),
  location: z.string().trim().max(500).optional(),
};

function validateMode(
  value: {
    mode: "online" | "offline";
    meetingLink?: string;
    location?: string;
  },
  ctx: z.RefinementCtx,
) {
  if (value.mode === "online" && !value.meetingLink)
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["meetingLink"],
      message: "Meeting link is required",
    });
  if (value.mode === "offline" && !value.location)
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["location"],
      message: "Location is required",
    });
}

export const createMockSchema = z
  .object({ applicationId: z.string().uuid(), ...mockScheduleFields })
  .superRefine(validateMode);
export const createMockSlotSchema = z
  .object(mockScheduleFields)
  .superRefine(validateMode);
export const bookMockSchema = z.object({
  applicationId: z.string().uuid(),
  slotId: z.string().uuid(),
});
export const cancelMockSchema = z.object({
  reason: z.string().trim().min(3).max(1000),
});
