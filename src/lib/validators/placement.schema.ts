import { z } from "zod";

export const markPlacementJoinedSchema =
  z.object({
    placementId:
      z.string().uuid(),

    joinedAt:
      z.string()
        .datetime()
        .optional(),
  });

export const closePlacementSchema =
  z.object({
    placementId:
      z.string().uuid(),

    reason:
      z.string()
        .trim()
        .min(3)
        .max(3000),
  });