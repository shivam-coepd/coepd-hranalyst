import { z } from "zod";

export const checklistInputSchema = z.object({
  mustHave: z
    .array(
      z.object({
        skill: z.string().trim().min(1),

        category: z.string().trim().min(1),

        importance: z.enum(["mandatory", "preferred"]),

        evidence_required: z.boolean(),
      }),
    )
    .min(1, "At least one must-have requirement is required"),

  goodToHave: z.array(
    z.object({
      skill: z.string().trim().min(1),

      category: z.string().trim().min(1),
    }),
  ),

  tools: z.array(
    z.object({
      name: z.string().trim().min(1),

      required_level: z.string(),
    }),
  ),

  domain: z.string().trim().min(1),

  expRequired: z.string().trim().min(1),

  top3Skills: z.array(z.string()).min(1).max(3),

  checklistSummary: z.string().trim().optional(),
});
