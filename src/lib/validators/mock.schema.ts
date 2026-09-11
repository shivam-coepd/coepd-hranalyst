import {
  z,
} from "zod";

export const createMockSchema =
  z.object({

    applicationId:
      z.string().uuid(),

    scheduledAt:
      z.string()
        .datetime(),

    durationMinutes:
      z.number()
        .int()
        .min(15)
        .max(240)
        .default(60),

    mode:
      z.enum([
        "online",
        "offline",
      ]),

    evaluatorUserId:
      z.string()
        .uuid(),

    meetingLink:
      z.string()
        .url()
        .optional(),

    location:
      z.string()
        .trim()
        .max(500)
        .optional(),

  })
  .superRefine(
    (
      value,
      ctx
    ) => {

      if (
        value.mode ===
          "online"
        &&
        !value.meetingLink
      ) {

        ctx.addIssue({
          code:
            z.ZodIssueCode.custom,

          path: [
            "meetingLink"
          ],

          message:
            "Meeting link is required",
        });
      }

      if (
        value.mode ===
          "offline"
        &&
        !value.location
      ) {

        ctx.addIssue({
          code:
            z.ZodIssueCode.custom,

          path: [
            "location"
          ],

          message:
            "Location is required",
        });
      }
    }
  );