import { z } from "zod";

export const studentProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(100),

  lastName: z.string().trim().min(1).max(100),

  phone: z.string().trim().min(8).max(30),

  city: z.string().trim().min(2).max(100),

  state: z.string().trim().max(100).optional(),

  country: z.string().trim().min(2).max(100),

  totalExperienceMonths: z.coerce.number().int().min(0).max(720),

  currentCompany: z.string().trim().max(255).optional(),

  currentDesignation: z.string().trim().max(255).optional(),

  currentCtc: z.coerce.number().min(0).optional(),

  expectedCtc: z.coerce.number().min(0).optional(),

  noticePeriodDays: z.coerce.number().int().min(0).max(365).optional(),

  preferredRole: z.enum(["BA", "PO", "PM"]).optional(),

  linkedinUrl: z.string().url().optional().or(z.literal("")),

  summary: z.string().trim().max(3000).optional(),
});
