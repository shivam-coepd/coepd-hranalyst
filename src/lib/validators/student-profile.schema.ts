import { z } from "zod";

const optionalNumber = <T extends z.ZodTypeAny>(schema: T) => 
  z.preprocess((val) => (val === "" || val === null ? undefined : val), schema.optional());

export const studentProfileSchema = z.object({
  firstName: z.string().trim().max(100).optional().or(z.literal("")),
  lastName: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  headline: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  qualification: z.string().trim().max(100).optional().or(z.literal("")),
  graduationYear: optionalNumber(z.coerce.number().int().min(1950).max(2100)),
  specialization: z.string().trim().max(100).optional().or(z.literal("")),
  totalExperienceMonths: optionalNumber(z.coerce.number().int().min(0).max(720)),
  currentCompany: z.string().trim().max(255).optional().or(z.literal("")),
  currentDesignation: z.string().trim().max(255).optional().or(z.literal("")),
  currentCtc: optionalNumber(z.coerce.number().min(0)),
  expectedCtc: optionalNumber(z.coerce.number().min(0)),
  noticePeriodDays: optionalNumber(z.coerce.number().int().min(0).max(365)),
  preferredRole: z.enum(["BA", "PO", "PM"]).optional().or(z.literal("")),
  preferredLocation: z.string().trim().max(255).optional().or(z.literal("")),
  preferredWorkplaceType: z.enum(["onsite", "hybrid", "remote"]).optional().or(z.literal("")),
  willingToRelocate: z.boolean().optional(),
  availabilityStatus: z.enum(["available", "interviewing", "not_available"]).optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  summary: z.string().trim().max(3000).optional().or(z.literal("")),
  skills: z.array(z.string()).optional(),
});
