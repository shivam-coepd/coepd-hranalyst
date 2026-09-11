import { z } from "zod";

export const jobSchema = z
  .object({
    companyId: z.string().uuid(),
    jobTitle: z.string().trim().min(2, "Job title is required").max(255),
    roleType: z.enum(["BA", "PO", "PM", "SM"]),
    locationType: z.enum(["domestic", "international"]),
    location: z.string().trim().max(255).optional(),
    country: z.string().trim().max(100).optional(),
    employmentType: z
      .enum(["full_time", "part_time", "contract", "internship"])
      .default("full_time"),
    workplaceType: z.enum(["onsite", "remote", "hybrid"]).default("onsite"),
    experienceMinMonths: z.coerce.number().int().min(0),
    experienceMaxMonths: z.coerce.number().int().min(0).optional(),
    salaryMin: z.coerce.number().min(0).optional(),
    salaryMax: z.coerce.number().min(0).optional(),
    salaryCurrency: z.string().trim().min(3).max(10).default("INR"),
    openings: z.coerce.number().int().min(1).max(10000),
    jdText: z.string().trim().min(50, "JD must contain at least 50 characters"),
    applicationDeadline: z
      .union([
        z.literal(""),
        z.string().datetime({ offset: true }),
        z.string().date(),
      ])
      .optional(),
    assignedPlacementHr: z.union([z.literal(""), z.string().uuid()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.experienceMaxMonths !== undefined &&
      data.experienceMaxMonths < data.experienceMinMonths
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["experienceMaxMonths"],
        message: "Maximum experience cannot be less than minimum experience",
      });
    }
    if (
      data.salaryMin !== undefined &&
      data.salaryMax !== undefined &&
      data.salaryMax < data.salaryMin
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "Maximum salary cannot be less than minimum salary",
      });
    }
  });
export type JobInput = z.infer<typeof jobSchema>;
