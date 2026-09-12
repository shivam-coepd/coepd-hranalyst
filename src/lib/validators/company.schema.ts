import { z } from "zod";

const optionalUrl = z
  .union([z.literal(""), z.string().url("Enter a valid URL")])
  .optional();
const optionalEmail = z
  .union([z.literal(""), z.string().email("Enter a valid email")])
  .optional();

export const companySchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required").max(255),
  legalName: z.string().trim().max(255).optional(),
  companyDomain: z
    .string()
    .trim()
    .max(255)
    .transform((v) =>
      v
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, ""),
    )
    .optional(),
  websiteUrl: z
    .string()
    .url("Enter a valid website URL")
    .optional()
    .or(z.literal("")),
  industry: z.string().trim().max(150).optional(),
  companySize: z.string().trim().max(100).optional(),
  primaryEmail: optionalEmail,
  primaryPhone: z.string().trim().max(30).optional(),
  registrationNumber: z.string().trim().max(150).optional(),
  gstNumber: z.string().trim().max(50).optional(),
  linkedinUrl: optionalUrl,
  address: z.string().trim().max(1000).optional(),
  city: z.string().trim().max(150).optional(),
  state: z.string().trim().max(150).optional(),
  country: z.string().trim().max(150).optional(),
  postalCode: z.string().trim().max(30).optional(),
});
export type CompanyInput = z.infer<typeof companySchema>;
