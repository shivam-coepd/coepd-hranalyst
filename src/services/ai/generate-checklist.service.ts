import "server-only";

import { getOpenAIClient } from "@/lib/openai/client";
import { GeneratedChecklistSchema } from "./checklist.schema";
import {
  buildChecklistPrompt,
  CHECKLIST_PROMPT_VERSION,
} from "./prompts/checklist.prompt";

export async function generateChecklistFromJD(job: {
  jobTitle: string;
  roleType: string;
  locationType: string;
  location?: string | null;
  experienceMinYears: number;
  experienceMaxYears?: number | null;
  jdText: string;
}) {
  const model = process.env.OPENAI_MODEL || "gpt-6-sol";

  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are an expert recruitment analyst who converts job descriptions into factual CV screening criteria. Return ONLY valid JSON that matches the requested schema.
CRITICAL ENUM REQUIREMENTS:
- 'category' MUST be one of: "business_analysis", "product", "domain", "technical", "soft_skill", "methodology", "tool", "other".
- 'importance' MUST be one of: "mandatory", "preferred".
- 'required_level' (for tools) MUST be one of: "basic", "working", "intermediate", "advanced", "not_specified".

Return a JSON object with the following structure:
{
  "must_have": [
    { "skill": "...", "category": "...", "importance": "...", "evidence_required": true }
  ],
  "good_to_have": [
    { "skill": "...", "category": "..." }
  ],
  "tools": [
    { "name": "...", "required_level": "..." }
  ],
  "domain": "...",
  "exp_required": "...",
  "top_3_skills": ["...", "...", "..."],
  "checklist_summary": "..."
}`,
      },
      {
        role: "user",
        content: buildChecklistPrompt(job),
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI checklist generation returned no text output");
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(content);
  } catch (err) {
    throw new Error("AI checklist generation returned invalid JSON");
  }

  const checklist = GeneratedChecklistSchema.parse(parsedJson);

  return {
    checklist,
    responseId: response.id || "unknown-response-id",
    model,
    promptVersion: CHECKLIST_PROMPT_VERSION,
    usage: {
      input_tokens: response.usage?.prompt_tokens || 0,
      output_tokens: response.usage?.completion_tokens || 0,
      total_tokens: response.usage?.total_tokens || 0,
    },
  };
}
