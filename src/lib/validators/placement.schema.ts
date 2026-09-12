import { z } from "zod";

export const confirmPlacementSchema = z.object({
  offerId: z.string().uuid(),
  notes: z.string().trim().max(5000).optional(),
});

export const markPlacementJoinedSchema = z.object({
  placementId: z.string().uuid(),
  joinedAt: z.string().datetime().optional(),
});

export const closePlacementSchema = z.object({
  placementId: z.string().uuid(),
  reason: z.string().trim().min(3).max(3000),
});

export const transitionPlacementSchema = z
  .object({
    placementId: z.string().uuid(),
    newStatus: z.enum([
      "joined",
      "joining_deferred",
      "offer_revoked",
      "candidate_declined_after_acceptance",
      "closed",
    ]),
    reason: z.string().trim().max(3000).optional(),
    effectiveAt: z.string().datetime().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      [
        "joining_deferred",
        "offer_revoked",
        "candidate_declined_after_acceptance",
        "closed",
      ].includes(value.newStatus) &&
      !value.reason?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "Reason is required for this placement transition",
      });
    }
  });
