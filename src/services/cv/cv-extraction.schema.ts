import { z } from "zod";

const EvidenceItem = z.object({
  name: z.string(),

  normalized_name: z.string(),

  evidence: z.string(),

  confidence: z.number().min(0).max(1),
});

const ExperienceItem = z.object({
  company: z.string(),

  designation: z.string(),

  start_date: z.string(),

  end_date: z.string(),

  duration_months: z.number().int().min(0),

  responsibilities: z.array(z.string()),

  skills: z.array(z.string()),

  tools: z.array(z.string()),
});

export const CvExtractionSchema = z.object({
  full_name: z.string(),

  email: z.string(),

  phone: z.string(),

  location: z.string(),

  linkedin_url: z.string(),

  professional_summary: z.string(),

  total_experience_months: z.number().int().min(0),

  current_company: z.string(),

  current_designation: z.string(),

  skills: z.array(EvidenceItem),

  tools: z.array(EvidenceItem),

  domains: z.array(EvidenceItem),

  methodologies: z.array(EvidenceItem),

  certifications: z.array(z.string()),

  education: z.array(
    z.object({
      qualification: z.string(),

      institution: z.string(),

      year: z.string(),
    }),
  ),

  experience: z.array(ExperienceItem),

  projects: z.array(
    z.object({
      name: z.string(),

      description: z.string(),

      skills: z.array(z.string()),

      tools: z.array(z.string()),
    }),
  ),
});

export type CvExtraction = z.infer<typeof CvExtractionSchema>;
