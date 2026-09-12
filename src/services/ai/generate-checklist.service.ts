import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

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

  experienceMinMonths: number;

  experienceMaxMonths?: number | null;

  jdText: string;
}) {
  const model = process.env.OPENAI_CHECKLIST_MODEL;

  if (!model) {
    throw new Error("OPENAI_CHECKLIST_MODEL is not configured");
  }

  const response = await getOpenAIClient().responses.parse({
    model,

    input: [
      {
        role: "system",

        content:
          "You are an expert recruitment analyst who converts job descriptions into factual CV screening criteria.",
      },

      {
        role: "user",

        content: buildChecklistPrompt(job),
      },
    ],

    text: {
      format: zodTextFormat(GeneratedChecklistSchema, "job_checklist"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("AI checklist generation returned no structured output");
  }

  return {
    checklist: response.output_parsed,

    responseId: response.id,

    model,

    promptVersion: CHECKLIST_PROMPT_VERSION,

    usage: response.usage,
  };
}
