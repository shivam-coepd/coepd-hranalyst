import { z } from "zod";

const ChecklistSkillSchema =
  z.object({
    skill: z.string().min(1),

    category: z.enum([
      "business_analysis",
      "product",
      "domain",
      "technical",
      "soft_skill",
      "methodology",
      "other",
    ]),

    importance: z.enum([
      "mandatory",
      "preferred",
    ]),

    evidence_required:
      z.boolean(),
  });

const ChecklistGoodSkillSchema =
  z.object({
    skill: z.string().min(1),

    category: z.enum([
      "business_analysis",
      "product",
      "domain",
      "technical",
      "soft_skill",
      "methodology",
      "tool",
      "other",
    ]),
  });

const ChecklistToolSchema =
  z.object({
    name: z.string().min(1),

    required_level:
      z.enum([
        "basic",
        "working",
        "intermediate",
        "advanced",
        "not_specified",
      ]),
  });

export const GeneratedChecklistSchema =
  z.object({

    must_have:
      z.array(
        ChecklistSkillSchema
      ),

    good_to_have:
      z.array(
        ChecklistGoodSkillSchema
      ),

    tools:
      z.array(
        ChecklistToolSchema
      ),

    domain:
      z.string(),

    exp_required:
      z.string(),

    top_3_skills:
      z.array(z.string())
        .max(3),

    checklist_summary:
      z.string(),
  });

export type GeneratedChecklist =
  z.infer<
    typeof GeneratedChecklistSchema
  >;