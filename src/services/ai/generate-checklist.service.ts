import "server-only";

import { getGeminiClient } from "@/lib/gemini/client";
import { Type } from "@google/genai";
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
  const model = process.env.GEMINI_CHECKLIST_MODEL;
  if (!model) {
    throw new Error("GEMINI_CHECKLIST_MODEL is not configured");
  }

  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model,
    contents: buildChecklistPrompt(job),
    config: {
      systemInstruction: `You are an expert recruitment analyst who converts job descriptions into factual CV screening criteria. Return ONLY valid JSON that matches the requested schema.
CRITICAL ENUM REQUIREMENTS:
- 'category' MUST be one of: "business_analysis", "product", "domain", "technical", "soft_skill", "methodology", "tool", "other".
- 'importance' MUST be one of: "mandatory", "preferred".
- 'required_level' (for tools) MUST be one of: "basic", "working", "intermediate", "advanced", "not_specified".`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          must_have: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                category: { 
                  type: Type.STRING,
                  enum: ["business_analysis", "product", "domain", "technical", "soft_skill", "methodology", "other"]
                },
                importance: { 
                  type: Type.STRING,
                  enum: ["mandatory", "preferred"]
                },
                evidence_required: { type: Type.BOOLEAN }
              },
              required: ["skill", "category", "importance", "evidence_required"]
            }
          },
          good_to_have: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                category: { 
                  type: Type.STRING,
                  enum: ["business_analysis", "product", "domain", "technical", "soft_skill", "methodology", "tool", "other"]
                }
              },
              required: ["skill", "category"]
            }
          },
          tools: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                required_level: { 
                  type: Type.STRING,
                  enum: ["basic", "working", "intermediate", "advanced", "not_specified"]
                }
              },
              required: ["name", "required_level"]
            }
          },
          domain: { type: Type.STRING },
          exp_required: { type: Type.STRING },
          top_3_skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          checklist_summary: { type: Type.STRING }
        },
        required: ["must_have", "good_to_have", "tools", "domain", "exp_required", "top_3_skills", "checklist_summary"]
      },
    },
  });

  if (!response.text) {
    throw new Error("AI checklist generation returned no text output");
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(response.text);
  } catch (err) {
    throw new Error("AI checklist generation returned invalid JSON");
  }

  const checklist = GeneratedChecklistSchema.parse(parsedJson);

  return {
    checklist,
    responseId: response.modelVersion || "unknown-response-id",
    model,
    promptVersion: CHECKLIST_PROMPT_VERSION,
    usage: {
      input_tokens: response.usageMetadata?.promptTokenCount || 0,
      output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: response.usageMetadata?.totalTokenCount || 0,
    },
  };
}
