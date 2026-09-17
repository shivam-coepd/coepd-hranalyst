import { z } from "zod";

export const mockScorecardSchema = z.object({
  mockId: z.string().uuid(),

  communicationScore: z.number().min(0).max(100),

  technicalScore: z.number().min(0).max(100),

  domainScore: z.number().min(0).max(100),

  strengths: z.string().trim().max(5000).optional(),

  improvementAreas: z.string().trim().max(5000).optional(),

  evaluatorNotes: z.string().trim().max(5000).optional(),

  studentVisibleNotes: z.string().trim().max(5000).optional(),

  recommendation: z.enum([
    "ready",
    "ready_with_minor_improvement",
    "needs_another_mock",
    "not_ready",
  ]),
});
